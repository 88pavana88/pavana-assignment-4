document.getElementById('search-form').addEventListener('submit', function (event) {
    event.preventDefault();

    let query = document.getElementById('query').value;
    let resultsDiv = document.getElementById('results');
    let chartContainer = document.getElementById('chart-container');
    
    // Clear previous results and hide the chart container initially
    resultsDiv.innerHTML = '';
    chartContainer.style.display = 'none';

    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'query': query
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Data received:", data);
        displayResults(data);
        displayChart(data);
    });
});

function displayResults(data) {
    let resultsDiv = document.getElementById('results');

    // Add "Results" title only if there are documents to display
    if (data.documents && data.documents.length > 0) {
        let title = document.createElement('h2');
        title.innerText = 'Results';
        resultsDiv.appendChild(title);
    }

    // Populate results
    for (let i = 0; i < data.documents.length; i++) {
        let docDiv = document.createElement('div');
        docDiv.innerHTML = `<strong>Document ${data.indices[i]}</strong><p>${data.documents[i]}</p><br><strong>Similarity: ${data.similarities[i]}</strong>`;
        resultsDiv.appendChild(docDiv);
    }
}

function displayChart(data) {
    const ctx = document.getElementById('similarity-chart').getContext('2d');
    let chartContainer = document.getElementById('chart-container');
    
    // Display the chart container
    chartContainer.style.display = 'block';

    // Destroy existing chart instance if it exists
    if (window.similarityChart) {
        window.similarityChart.destroy();
    }

    // Create and store the chart instance globally
    window.similarityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.indices.map(i => `Document ${i}`),
            datasets: [{
                label: 'Cosine Similarity',
                data: data.similarities,
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1.0 // Set y-axis maximum to 1.0
                },
                x: {
                    ticks: {
                        display: false // Hide x-axis labels
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}
