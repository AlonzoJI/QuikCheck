import { useState } from 'react'

function NewsCard({ article, animationClass }) {
  const [summaryType, setSummaryType] = useState('standardSummary')
  
  return (
    <div className={`news-card ${animationClass || ''}`}>
        
        <div className="card-header">
            <span className="source">{article.source}</span>
        </div>

        <h2 className='headline'>{article.headline}</h2>

        <div className="summary-controls">
            <button 
                className={`summary-btn ${summaryType === 'briefSummary' ? 'active' : ''}`}
                onClick={() => setSummaryType('briefSummary')}>Brief
            </button>
            <button 
                className={`summary-btn ${summaryType === 'standardSummary' ? 'active' : ''}`}
                onClick={() => setSummaryType('standardSummary')}>Standard
            </button>
            <button 
                className={`summary-btn ${summaryType === 'detailedSummary' ? 'active' : ''}`}
                onClick={() => setSummaryType('detailedSummary')}>Detailed
            </button>
        </div>

        <p className="summary-text">{article[summaryType]}</p>

        <div className="card-footer">
        <span className="category">{article.category}</span>
        </div>

    </div>
  )
}

export default NewsCard