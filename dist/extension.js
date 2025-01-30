"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const index_1 = require("./index");
class ResultsProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    results = [];
    refresh(selectedText, data) {
        this.results = [new SelectedTextItem(selectedText)];
        if (data.length === 0) {
            this.results.push(new EmptyResultItem());
        }
        else {
            data.forEach((item, index) => {
                const parentItem = new PairGroupItem(index);
                parentItem.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
                this.results.push(parentItem);
                parentItem.children = [
                    new SlowItem(item.slow),
                    new FastArrowItem(item.fast)
                ];
            });
        }
        this._onDidChangeTreeData.fire();
        // 強制的に全ての項目を展開
        vscode.commands.executeCommand('workbench.actions.treeView.jsboosterResults.expandAll');
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element instanceof PairGroupItem) {
            return Promise.resolve(element.children);
        }
        return Promise.resolve(this.results);
    }
    clear() {
        this.results = [new EmptyResultItem()];
        this._onDidChangeTreeData.fire();
    }
}
class SelectedTextItem extends vscode.TreeItem {
    constructor(selectedText) {
        super(`選択したコード : ${selectedText}`, vscode.TreeItemCollapsibleState.None);
        this.tooltip = selectedText;
    }
}
class PairGroupItem extends vscode.TreeItem {
    children = [];
    constructor(index) {
        super(`変換候補 ${index + 1}`, vscode.TreeItemCollapsibleState.Expanded);
    }
}
class SlowItem extends vscode.TreeItem {
    slow;
    constructor(slow) {
        super(`slow: "${slow}"`, vscode.TreeItemCollapsibleState.None);
        this.slow = slow;
        this.tooltip = slow;
        this.command = {
            command: 'jsbooster.copyToClipboard',
            title: 'コピー',
            arguments: [slow]
        };
    }
}
class FastArrowItem extends vscode.TreeItem {
    fast;
    constructor(fast) {
        super(`→ fast: "${fast}"`, vscode.TreeItemCollapsibleState.None);
        this.fast = fast;
        this.tooltip = fast;
        this.command = {
            command: 'jsbooster.copyToClipboard',
            title: 'コピー',
            arguments: [fast]
        };
    }
}
class EmptyResultItem extends vscode.TreeItem {
    constructor() {
        super("候補が見つかりませんでした", vscode.TreeItemCollapsibleState.None);
        this.tooltip = "候補が見つかりませんでした";
    }
}
// サイドバーの表示状態を確認する関数
async function isSidebarVisible() {
    const views = await vscode.window.tabGroups.all
        .flatMap(group => group.tabs)
        .filter(tab => tab.input instanceof vscode.TabInputWebview)
        .map(tab => tab.input.viewType);
    return views.includes('jsbooster-sidebar');
}
function activate(context) {
    console.log('Congratulations, your extension "jsbooster" is now active!');
    const resultsProvider = new ResultsProvider();
    vscode.window.registerTreeDataProvider('jsboosterResults', resultsProvider);
    let disposable = vscode.commands.registerCommand('jsbooster.slow2fast_code', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const selection = editor.selection;
            const selectedText = document.getText(selection);
            if (selectedText) {
                try {
                    const res = await (0, index_1.callAPI)(selectedText);
                    const responseMessage = Array.isArray(res['response']) ? res['response'] : [];
                    // サイドバーの表示状態を確認
                    const isVisible = await isSidebarVisible();
                    // 結果を更新
                    resultsProvider.refresh(selectedText, responseMessage);
                    // サイドバーが表示されていない場合のみ、表示する
                    if (!isVisible) {
                        await vscode.commands.executeCommand('workbench.view.extension.jsbooster-sidebar');
                    }
                    // フォーカスをビューに移動（サイドバーが既に開いている場合も含む）
                    await vscode.commands.executeCommand('jsboosterResults.focus');
                }
                catch (error) {
                    vscode.window.showErrorMessage('APIの呼び出しに失敗しました');
                    resultsProvider.clear();
                }
            }
            else {
                vscode.window.showInformationMessage('何も選択されていません。');
            }
        }
        else {
            vscode.window.showInformationMessage('アクティブなエディタがありません。');
        }
    });
    let copyDisposable = vscode.commands.registerCommand('jsbooster.copyToClipboard', (text) => {
        vscode.env.clipboard.writeText(text);
        vscode.window.showInformationMessage('コピーしました');
    });
    context.subscriptions.push(disposable, copyDisposable);
    const button = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
    button.name = 'May Convert Fast JS';
    button.command = 'jsbooster.slow2fast_code';
    button.text = '$(rocket) May Convert Fast';
    button.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    context.subscriptions.push(button);
    button.show();
}
function deactivate() { }
//# sourceMappingURL=extension.js.map