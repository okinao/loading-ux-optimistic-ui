import React, { useState } from 'react';

// チャットメッセージコンポーネント
const Message = ({ message }) => {
  const statusIcon = {
    sending: '⏳',
    sent: '✓',
    error: '⚠️'
  };

  const statusColor = {
    sending: 'text-slate-400',
    sent: 'text-green-600',
    error: 'text-red-600'
  };

  return (
    <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        U
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">あなた</span>
          <span className={`text-xs ${statusColor[message.status]}`}>
            {statusIcon[message.status]}
            {message.status === 'sending' && ' 送信中'}
            {message.status === 'sent' && ' 送信済み'}
            {message.status === 'error' && ' 送信失敗'}
          </span>
        </div>
        <p className="text-slate-700 mt-1 break-words">{message.text}</p>
        {message.status === 'error' && (
          <button className="text-sm text-blue-600 hover:underline mt-2">
            再送信
          </button>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [shouldFail, setShouldFail] = useState(false);

  // メッセージ送信（オプティミスティックUI）
  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const tempId = Date.now();

    // 1. 即時反映（楽観的更新）
    setMessages(prev => [...prev, { id: tempId, text, status: 'sending' }]);
    setInputText('');

    // 2. 非同期処理をシミュレート
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // エラーをシミュレート
      if (shouldFail) {
        throw new Error('Network error');
      }

      // 3. 成功時：ステータスを更新
      setMessages(prev => prev.map(msg =>
        msg.id === tempId ? { ...msg, status: 'sent' } : msg
      ));
    } catch (error) {
      // 4. エラー時：エラー表示
      setMessages(prev => prev.map(msg =>
        msg.id === tempId ? { ...msg, status: 'error' } : msg
      ));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            オプティミスティックUI デモ
          </h1>
          <p className="text-slate-600 mb-4">
            サーバーレスポンスを待たずにUIを即座に更新
          </p>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={shouldFail}
              onChange={(e) => setShouldFail(e.target.checked)}
              className="rounded"
            />
            <span>次のメッセージを失敗させる（エラーハンドリングのデモ）</span>
          </label>
        </div>

        {/* チャットエリア */}
        <div className="bg-slate-100 rounded-lg p-4 min-h-[400px] max-h-[500px] overflow-y-auto space-y-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              メッセージを送信してみてください
            </div>
          ) : (
            messages.map(message => (
              <Message key={message.id} message={message} />
            ))
          )}
        </div>

        {/* 入力フォーム */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            送信
          </button>
        </form>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-2">仕組み</h2>
          <ol className="list-decimal list-inside space-y-2 text-slate-700">
            <li>メッセージをすぐに画面に表示（status: sending）</li>
            <li>バックグラウンドでサーバーに送信</li>
            <li>成功したらステータスを更新（status: sent）</li>
            <li>失敗したらエラー表示と再送信オプションを提供</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
