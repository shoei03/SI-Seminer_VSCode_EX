import * as vscode from 'vscode';
import { callAPI } from './index';

// 任意のプロパティを持つAPIレスポンスの型を定義
interface ApiResponse {
  [key: string]: string; // すべてのプロパティはstring型
}

export function activate(context: vscode.ExtensionContext) {
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
        const data = callAPI(selectedText);
        // APIの結果を表示
        data.then((res: unknown) => {
          // 型アサーションで，全てApiResponse型（string）として扱う
          const response = res as ApiResponse;
          // 入力値をキーとして値を取得
          const responseMessage = response[selectedText] || `Unknown input: ${selectedText}`;
          vscode.window.showInformationMessage(`APIの結果: ${responseMessage}`);
        });
      } else {
        vscode.window.showInformationMessage('何も選択されていません。');
      }
    } else {
      vscode.window.showInformationMessage('アクティブなエディタがありません。');
    }
  });

  // コンテキストにコマンドを登録
  context.subscriptions.push(disposable);
}

export function deactivate() {}
