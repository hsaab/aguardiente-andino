import { useEffect, useRef, useState } from 'react';

import SectionCard from './SectionCard.jsx';
import { streamBriefingChatAnswer } from '../lib/briefingChat.js';

export default function BriefingChat({ briefing }) {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isAnswering) return;

    const userMessage = createMessage('user', trimmedQuestion);
    const assistantMessage = createMessage('assistant', '');
    setMessages((current) => [...current, userMessage, assistantMessage]);
    setQuestion('');
    setError(null);
    setIsAnswering(true);

    try {
      const finalAnswer = await streamBriefingChatAnswer({
        briefing,
        question: trimmedQuestion,
        onText: (textSnapshot) => {
          updateMessage(assistantMessage.id, textSnapshot);
        },
      });
      updateMessage(assistantMessage.id, finalAnswer);
    } catch (err) {
      console.error('[briefing-chat] answer failed', err);
      setError(err.code === 'MISSING_KEY' ? 'Missing Anthropic API key.' : 'Chat answer failed. Try again.');
      updateMessage(
        assistantMessage.id,
        "I couldn't answer that just now. Check the connection and try again."
      );
    } finally {
      setIsAnswering(false);
    }
  }

  function updateMessage(id, content) {
    setMessages((current) =>
      current.map((message) => (message.id === id ? { ...message, content } : message))
    );
  }

  return (
    <SectionCard eyebrow="Ask the briefing" title="Follow-up questions" accent="gold">
      <div className="space-y-5">
        {messages.length === 0 ? (
          <div className="rounded-lg border border-charcoal/10 bg-cream/70 p-5 text-sm text-charcoal/75">
            Ask about the summary, top accounts, competitor pressure, promo waste, or this week's actions.
          </div>
        ) : (
          <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="sr-only" htmlFor="briefing-chat-question">
            Ask a follow-up question
          </label>
          <textarea
            id="briefing-chat-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="What should we do first this week?"
            rows={3}
            className="w-full resize-none rounded-xl border border-charcoal/10 bg-surface px-4 py-3 text-sm text-charcoal shadow-card outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/15"
            disabled={isAnswering}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-danger min-h-[1.25rem]">{error}</div>
            <button
              type="submit"
              className="btn-primary"
              disabled={isAnswering || !question.trim()}
            >
              {isAnswering ? 'Answering...' : 'Ask Claude'}
            </button>
          </div>
        </form>
      </div>
    </SectionCard>
  );
}

function ChatBubble({ message }) {
  const isUser = message.role === 'user';
  const classes = isUser
    ? 'ml-auto bg-emerald-800 text-white'
    : 'mr-auto bg-cream text-charcoal border border-charcoal/10';
  return (
    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-card ${classes}`}>
      <div className="whitespace-pre-wrap">{message.content || 'Thinking...'}</div>
    </div>
  );
}

function createMessage(role, content) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
  };
}
