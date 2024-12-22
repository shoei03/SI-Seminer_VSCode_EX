import * as vscode from 'vscode';

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
      const selectedTextArray = selectedText.split(/[\s\n]+/);

      if (selectedText) {
        // 選択したテキストを表示
        vscode.window.showInformationMessage(`選択したテキスト: ${selectedText}`);
        // 区切ったテキストを表示
        vscode.window.showInformationMessage(`区切ったテキスト: ${selectedTextArray}`);
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
