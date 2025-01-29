import * as vscode from 'vscode';
import { callAPI } from './index';

// 任意のプロパティを持つAPIレスポンスの型を定義
interface ApiResponse {
  [key: string]: string;
}

// サイドバーへの表示形式の成形
class ResultsProvider implements vscode.TreeDataProvider<ResultItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<ResultItem | undefined | null | void> = new vscode.EventEmitter<ResultItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<ResultItem | undefined | null | void> = this._onDidChangeTreeData.event;

  private results: ResultItem[] = [];
  private noResultsMessage: boolean = false; // 結果が空値かどうかのフラグ

  refresh(data: { slow: string; fast: string }[]): void {
    if (data.length === 0) {
      this.noResultsMessage = true;
      this.results = [];
    } else {
      this.noResultsMessage = false;
      this.results = data.map(item => new ResultItem(
        `Slow: ${item.slow}`,
        `Fast: ${item.fast}`
      ));
    }
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ResultItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ResultItem): Thenable<ResultItem[]> {
    if (this.noResultsMessage) {
      return Promise.resolve([new ResultItem("候補が見つかりませんでした", "")]);
    }
    
    if (element) {
      return Promise.resolve([]);
    }
    return Promise.resolve(this.results);
  }

  clear(): void {
    this.results = [];
    this.noResultsMessage = false;
    this._onDidChangeTreeData.fire();
  }
}

class ResultItem extends vscode.TreeItem {
  constructor(
    public readonly slow: string,
    public readonly fast: string
  ) {
    super(`${slow} → \n${fast}`, vscode.TreeItemCollapsibleState.None);
    this.tooltip = `${slow} → ${fast}`;
  }
}

export function activate(context: vscode.ExtensionContext) {
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
          const res = await callAPI(selectedText) as ApiResponse;
          const responseMessage: { fast: string; slow: string }[] = 
            Array.isArray(res['response']) ? res['response'] : [];

          /*
          if (responseMessage.length === 0) {
            vscode.window.showInformationMessage("候補が見つかりませんでした");
            resultsProvider.clear();
            return;
          } 
          */

          // 結果をサイドバーに表示
          resultsProvider.refresh(responseMessage);
          
          // サイドバーを表示
          vscode.commands.executeCommand('workbench.view.extension.jsbooster-sidebar');

        } catch (error) {
          vscode.window.showErrorMessage('APIの呼び出しに失敗しました');
          resultsProvider.clear();
        }
      } else {
        vscode.window.showInformationMessage('何も選択されていません。');
      }
    } else {
      vscode.window.showInformationMessage('アクティブなエディタがありません。');
    }
  });

  context.subscriptions.push(disposable);

  // ステータスバーの設定
  const button = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    0
  );
  button.name = 'May Convert Fast JS';
  button.command = 'jsbooster.slow2fast_code';
  button.text = '$(rocket) May Convert Fast';
  button.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
  context.subscriptions.push(button);
  button.show();
}

export function deactivate() {}