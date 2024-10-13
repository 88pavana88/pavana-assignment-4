from flask import Flask, render_template, request, jsonify
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import nltk
from nltk.corpus import stopwords

nltk.download('stopwords')

app = Flask(__name__)

# Fetch dataset, initialize vectorizer and LSA here
newsgroups = fetch_20newsgroups(subset='all')
documents = newsgroups.data
vectorizer = TfidfVectorizer(stop_words=stopwords.words('english'), max_features=5000)
tfidf_matrix = vectorizer.fit_transform(documents)
svd = TruncatedSVD(n_components=200)  
reducedMatrix = svd.fit_transform(tfidf_matrix)

def search_engine(query):
    """
    Function to search for top 5 similar documents given a query
    Input: query (str)
    Output: documents (list), similarities (list), indices (list)
    """
    transformedQuery = vectorizer.transform([query])
    reducedQueryVector = svd.transform(transformedQuery)
    similarityScores = cosine_similarity(reducedQueryVector, reducedMatrix)[0]
    bestMatchIndices = similarityScores.argsort()[-5:][::-1]
    bestMatchScores = similarityScores[bestMatchIndices]
    bestMatchDocuments = [documents[i] for i in bestMatchIndices]

    return bestMatchDocuments, bestMatchScores.tolist(), bestMatchIndices.tolist()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    query = request.form['query']
    documents, similarities, indices = search_engine(query)
    return jsonify({'documents': documents, 'similarities': similarities, 'indices': indices}) 

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3000)
