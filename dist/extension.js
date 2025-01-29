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
function activate(context) {
    console.log('Congratulations, your extension "jsbooster" is now active!');
    // コマンドの登録
    let disposable = vscode.commands.registerCommand('jsbooster.showSelectedText', () => {
        // アクティブなエディタを取得
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const selection = editor.selection;
            // 選択したテキストを取得
            const selectedText = document.getText(selection);
            // 選択したテキストを空白または、改行コードで区切る
            //const selectedTextArray = selectedText.split(/[\s\n]+/);
            if (selectedText) {
                // 選択したテキストを表示
                vscode.window.showInformationMessage(`選択したテキスト: ${selectedText}`);
                // 区切ったテキストを表示
                //vscode.window.showInformationMessage(`区切ったテキスト: ${selectedTextArray}`);
                // APIを叩く
                const data = (0, index_1.callAPI)(selectedText);
                // APIの結果を表示
                data.then((res) => {
                    // 型アサーションで，全てApiResponse型（string）として扱う
                    const response = res;
                    // 入力値をキーとして値を取得
                    //const responseMessage = response['response'] || `Unknown input: ${selectedText}`;
                    const responseMessage = Array.isArray(response['response']) ? response['response'] : [];
                    responseMessage.forEach((item, index) => {
                        vscode.window.showInformationMessage(`Index ${index}: fast = ${item.fast}, slow = ${item.slow}`);
                    });
                    // vscode.window.showInformationMessage(`APIの結果: ${responseMessage}`);
                });
            }
            else {
                vscode.window.showInformationMessage('何も選択されていません。');
            }
        }
        else {
            vscode.window.showInformationMessage('アクティブなエディタがありません。');
        }
    });
    // コンテキストにコマンドを登録
    context.subscriptions.push(disposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map