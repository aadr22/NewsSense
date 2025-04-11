# nlp/qa_system.py
import json
import sys
from datetime import datetime, timedelta

def get_fund_performance_description(fund):
    """Generate a description of fund performance."""
    if not fund or not fund.get('priceHistory'):
        return "No performance data available."
    
    # Sort price history by date
    price_history = sorted(fund['priceHistory'], key=lambda x: x['date'], reverse=True)
    
    if not price_history:
        return "No performance data available."
    
    latest = price_history[0]
    
    # Get performance for different time periods
    day_change = latest['changePercent']
    
    # Determine performance description
    if day_change > 0:
        performance = f"up {abs(day_change):.2f}%"
    elif day_change < 0:
        performance = f"down {abs(day_change):.2f}%"
    else:
        performance = "unchanged"
    
    return performance

def get_news_summary(news_items):
    """Generate a summary of news items."""
    if not news_items:
        return "No relevant news found."
    
    # Group news by sentiment
    positive_news = [n for n in news_items if n.get('sentiment') == 'POSITIVE']
    negative_news = [n for n in news_items if n.get('sentiment') == 'NEGATIVE']
    neutral_news = [n for n in news_items if n.get('sentiment') == 'NEUTRAL']
    
    summary = []
    
    if positive_news:
        summary.append(f"Positive news: {len(positive_news)} articles")
        summary.append(f"Most recent: {positive_news[0]['title']}")
    
    if negative_news:
        summary.append(f"Negative news: {len(negative_news)} articles")
        summary.append(f"Most recent: {negative_news[0]['title']}")
    
    if neutral_news:
        summary.append(f"Neutral news: {len(neutral_news)} articles")
    
    return "\n".join(summary)

def answer_question(context):
    """Generate an answer to the user's question."""
    question = context.get('question', '')
    funds = context.get('funds', [])
    news = context.get('news', [])
    
    # Simple keyword-based approach
    question_lower = question.lower()
    
    # Check for fund performance questions
    if "why" in question_lower and ("down" in question_lower or "up" in question_lower):
        if funds:
            fund = funds[0]
            performance = get_fund_performance_description(fund)
            news_summary = get_news_summary(news)
            
            answer = f"{fund['name']} ({fund['symbol']}) is {performance} today. "
            answer += f"\n\n{news_summary}"
            
            return {
                "question": question,
                "answer": answer,
                "fund_symbol": fund['symbol']
            }
        else:
            return {
                "question": question,
                "answer": "I couldn't find information about that fund. Please check the symbol and try again."
            }
    
    # Check for general news questions
    elif "news" in question_lower or "happening" in question_lower:
        if news:
            news_summary = get_news_summary(news)
            
            answer = f"Here's what's happening: \n\n{news_summary}"
            
            return {
                "question": question,
                "answer": answer
            }
        else:
            return {
                "question": question,
                "answer": "I couldn't find any relevant news at this time."
            }
    
    # Default response
    else:
        return {
            "question": question,
            "answer": "I'm not sure how to answer that question. Try asking about why a fund is up or down, or about recent news affecting a fund."
        }

# Read input from stdin
input_data = sys.stdin.read()
context = json.loads(input_data)

# Generate answer
result = answer_question(context)

# Output result as JSON
print(json.dumps(result))
