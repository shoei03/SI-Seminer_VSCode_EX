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
// サイドバーへの表示形式の成形
class ResultsProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    results = [];
    refresh(data) {
        this.results = data.map(item => new ResultItem(`Slow: ${item.slow}`, `Fast: ${item.fast}`));
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            return Promise.resolve([]);
        }
        return Promise.resolve(this.results);
    }
    clear() {
        this.results = [];
        this._onDidChangeTreeData.fire();
    }
}
class ResultItem extends vscode.TreeItem {
    slow;
    fast;
    constructor(slow, fast) {
        super(`${slow} → ${fast}`, vscode.TreeItemCollapsibleState.None);
        this.slow = slow;
        this.fast = fast;
        this.tooltip = `${slow} → ${fast}`;
    }
}
function activate(context) {
    console.log('Congratulations, your extension "jsbooster" is now active!');
    // Results Providerの作成とビューへの登録
    const resultsProvider = new ResultsProvider();
    vscode.window.registerTreeDataProvider('jsboosterResults', resultsProvider);
    // コマンドの登録
    let disposable = vscode.commands.registerCommand('jsbooster.slow2fast_code', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const selection = editor.selection;
            // 選択したテキストを取得
            const selectedText = document.getText(selection);
            if (selectedText) {
                try {
                    // APIを叩く 入力値をキーとして値を取得
                    const res = await (0, index_1.callAPI)(selectedText);
                    const responseMessage = Array.isArray(res['response']) ? res['response'] : [];
                    if (responseMessage.length === 0) {
                        vscode.window.showInformationMessage("候補が見つかりませんでした");
                        resultsProvider.clear();
                        return;
                    }
                    // 結果をサイドバーに表示
                    resultsProvider.refresh(responseMessage);
                    // サイドバーを表示
                    vscode.commands.executeCommand('workbench.view.extension.jsbooster-sidebar');
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
    context.subscriptions.push(disposable);
    // ステータスバーの設定
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