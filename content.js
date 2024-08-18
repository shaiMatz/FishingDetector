
const obfuscatedApiKey = 'QUl6YVN5RFRFcmhRWEJJemJISXJmZEkxTWlKRzdJZ0ctalEySWZz'; // Base64 encoded key
const API_KEY = atob(obfuscatedApiKey); // Decode the API key
console.log('API Key:', API_KEY);
const checkedUrls = new Set(); // Track already checked URLs
let mutationTimeout; // Declare the mutationTimeout variable

// Customizable settings
const settings = {
    mutationProcessingDelay: 300, // Adjusted delay to reduce rapid mutation processing
    maxUrlsToProcess: 50, // Limit the number of URLs processed in one batch
    delayBetweenRequests: 500, // Delay between processing each URL
    apiRequestLimit: 5, // Max API requests per second
    dangerLinkStyle: {
        color: 'red',
        textDecoration: 'underline',
        backgroundColorOnHover: 'yellow',
        reportButton: {
            text: 'Report',
            marginLeft: '10px',
            backgroundColor: '#ff4d4d',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
        }
    }
};

// Throttling control
let apiRequestsInCurrentSecond = 0;
let apiThrottlingTimeout;

function startThrottling() {
    apiRequestsInCurrentSecond = 0;
    clearTimeout(apiThrottlingTimeout);
    apiThrottlingTimeout = setTimeout(startThrottling, 1000); // Reset every second
}

startThrottling(); // Start throttling control

// Function to canonicalize URLs
function canonicalizeUrl(url) {
    try {
        console.log('URL before canonicalize:', url);
        let urlObj;
        try {
            urlObj = new URL(url, document.baseURI);  // Use document.baseURI for relative URLs
            console.log('URL object created successfully:', urlObj.href);
        } catch (e) {
            console.error('Error creating URL object:', e);
            return null;
        }

        // Normalize hostname
        urlObj.hostname = urlObj.hostname.toLowerCase();
        console.log('Hostname normalized:', urlObj.hostname);

        // Remove fragment
        urlObj.hash = '';
        console.log('Hash removed:', urlObj.href);



        let previousPathname;
        let decodeAttempts = 0;
        while (urlObj.pathname.includes('%') && decodeAttempts < 5) {
            previousPathname = urlObj.pathname;
            try {
                urlObj.pathname = decodeURIComponent(urlObj.pathname);
                console.log('Pathname decoded:', urlObj.pathname);
            } catch (e) {
                console.warn('Decoding failed, proceeding with original pathname.', e);
                break;
            }
            decodeAttempts++;

            // Exit loop if no change in pathname
            if (urlObj.pathname === previousPathname) {
                console.log('No change after decoding, exiting loop.');
                break;
            }
        }

        if (decodeAttempts >= 5) {
            console.error('Path decoding loop exceeded maximum attempts:', urlObj.pathname);
        }

        // Normalize path
        urlObj.pathname = urlObj.pathname.replace(/\/\.\//g, '/');
        urlObj.pathname = urlObj.pathname.replace(/\/\.$/, '/');
        console.log('Path normalized:', urlObj.pathname);

        // Percent-escape necessary characters
        urlObj.pathname = urlObj.pathname.split('').map(c => {
            const code = c.charCodeAt(0);
            return (code <= 32 || code >= 127 || c === '#' || c === '%') ? '%' + code.toString(16).toUpperCase() : c;
        }).join('');
        console.log('URL after canonicalize:', urlObj.href);
        return urlObj.href;
    } catch (error) {
        console.error('Invalid URL:', url, error);
        return null;  // Return null if the URL is invalid
    }
}


function fetchWithTimeout(url, options = {}, timeout = 10000) { // 10 seconds timeout
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out')), timeout)
        )
    ]);
}

// Function to check URLs using Google Safe Browsing API
async function checkUrlWithGoogleSafeBrowsing(url) {
    if (apiRequestsInCurrentSecond >= settings.apiRequestLimit) {
        console.warn('Throttling API requests...');
        await delay(1000); // Wait for a second before retrying
    }

    console.log(`Checking URL: ${url}`);
    const canonicalUrl = canonicalizeUrl(url);
    console.log(`Canonical URL: ${canonicalUrl}`);
    if (!canonicalUrl || checkedUrls.has(canonicalUrl)) {
        console.warn(`Skipping URL: ${url} - Invalid or already checked`);
        return false;  // Skip checking if the URL is invalid or already checked
    }
    console.log('Checking URL2:', canonicalUrl);
    checkedUrls.add(canonicalUrl); // Add URL to the checked set
    apiRequestsInCurrentSecond++; // Increment API request count
    console.log('Checking URL3:', canonicalUrl);
    const requestBody = {
        client: {
            clientVersion: "1.0"
        },
        threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url: canonicalUrl }]
        }
    };

    console.log("Request Body:", requestBody);

    try {
        const response = await fetchWithTimeout(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`HTTP error! status: ${response.status}`, errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Response Data:", data);
        return data.matches && data.matches.length > 0 ? true : false;
    } catch (error) {
        console.error('Error checking URL with Google Safe Browsing:', error.message);
        return false;  // Assume the URL is safe if the check fails
    }
}

// Function to mark a URL as dangerous
function markUrlAsDangerous(url) {
    const linkElements = document.querySelectorAll('a');
    let found = false;

    linkElements.forEach(linkElement => {
        const domUrl = canonicalizeUrl(linkElement.href);
        if (domUrl === canonicalizeUrl(url)) {
            linkElement.style.color = settings.dangerLinkStyle.color;
            linkElement.style.textDecoration = settings.dangerLinkStyle.textDecoration;
            linkElement.title = 'Warning: This link is potentially dangerous!';

            linkElement.addEventListener('mouseover', () => {
                linkElement.style.backgroundColor = settings.dangerLinkStyle.backgroundColorOnHover;
            });
            linkElement.addEventListener('mouseout', () => {
                linkElement.style.backgroundColor = '';
            });

            const reportButton = document.createElement('button');
            reportButton.textContent = settings.dangerLinkStyle.reportButton.text;
            reportButton.style.marginLeft = settings.dangerLinkStyle.reportButton.marginLeft;
            reportButton.style.backgroundColor = settings.dangerLinkStyle.reportButton.backgroundColor;
            reportButton.style.color = settings.dangerLinkStyle.reportButton.color;
            reportButton.style.border = settings.dangerLinkStyle.reportButton.border;
            reportButton.style.borderRadius = settings.dangerLinkStyle.reportButton.borderRadius;
            reportButton.style.cursor = settings.dangerLinkStyle.reportButton.cursor;

            linkElement.parentNode.insertBefore(reportButton, linkElement.nextSibling);

            reportButton.addEventListener('click', () => {
                reportSuspiciousLink(url);
            });

            found = true;
        }
    });

    if (!found) {
        console.warn(`Could not find link element for URL: ${url}`);
    }
}

// Function to process a single URL
async function processUrl(url) {
    if (checkedUrls.has(url)) {
        return;
    }

    console.log(`Processing URL: ${url}`);
    showLoadingIndicator(); // Show loading indicator

    try {
        const isPhishing = await checkUrlWithGoogleSafeBrowsing(url);
        if (isPhishing) {
            console.log(`Warning: ${url} is potentially dangerous!`);
            markUrlAsDangerous(url);
        } else {
            console.log(`${url} is safe.`);
        }
    } catch (error) {
        console.error(`Failed to process URL: ${url}. Error:`, error);
    } finally {
        hideLoadingIndicator(); // Hide loading indicator
    }
}

// Function to process a batch of URLs in parallel
async function processBatchInParallel(urls) {
    console.log(`Starting to process batch of ${urls.length} URLs in parallel.`);

    const promises = urls.map(url => processUrlSequentially(url));

    try {
        await Promise.all(promises);
        console.log(`Finished processing batch of ${urls.length} URLs.`);
    } catch (error) {
        console.error('Error occurred while processing batch in parallel:', error);
    }
}

// Function to process all URLs on the page
function processPageUrls() {
    const urls = Array.from(document.querySelectorAll('a')).map(link => link.href);
    console.log('Initial URL list:', urls);

    const batchSize = settings.maxUrlsToProcess; // Determine your batch size
    for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        processBatchInParallel(batch); // Process each batch in parallel
    }
}

// Delay function for controlled waiting
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Show loading indicator (user feedback)
function showLoadingIndicator(urlsProcessing) {
    let loadingIndicator = document.getElementById('loading-indicator');
    if (!loadingIndicator) {
        loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'loading-indicator';
        loadingIndicator.style.position = 'fixed';
        loadingIndicator.style.top = '10px';
        loadingIndicator.style.right = '10px';
        loadingIndicator.style.backgroundColor = '#000';
        loadingIndicator.style.color = '#fff';
        loadingIndicator.style.padding = '5px 10px';
        loadingIndicator.style.borderRadius = '3px';
        document.body.appendChild(loadingIndicator);
    }

    loadingIndicator.textContent = `Checking URLs... (${urlsProcessing} remaining)`;
}

// Hide loading indicator
function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        document.body.removeChild(loadingIndicator);
    }
}

// Function to report a suspicious link
function reportSuspiciousLink(url) {
    const googleReportUrl = `https://safebrowsing.google.com/safebrowsing/report_phish/?url=${encodeURIComponent(url)}`;
    window.open(googleReportUrl, '_blank'); // Opens the Google report page in a new tab
    alert(`Thank you! The suspicious link has been reported: ${url}`);
}

// Process URLs sequentially with error handling
async function processUrlSequentially(url) {
    try {
        console.log(`Processing individual URL: ${url}`);
        await processUrl(url);
    } catch (error) {
        console.error(`Error processing URL ${url}:`, error);
    }
}

// Set up a MutationObserver to watch for new URLs being added
const observer = new MutationObserver(mutations => {
    console.log('Processing mutations...');
    clearTimeout(mutationTimeout);

    mutationTimeout = setTimeout(() => {
        let mutationUrls = [];

        mutations.forEach(mutation => {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeName === 'A' && node.href) {
                        mutationUrls.push(node.href);
                    } else if (node.querySelectorAll) {
                        const newLinks = node.querySelectorAll('a');
                        newLinks.forEach(link => mutationUrls.push(link.href));
                    }
                });
            }
        });

        if (mutationUrls.length > 0) {
            const uniqueUrls = [...new Set(mutationUrls)];
            const limitedUrls = uniqueUrls.slice(0, settings.maxUrlsToProcess); // Limit number of URLs processed
            processBatchInParallel(limitedUrls);
        }
    }, settings.mutationProcessingDelay);
});

// Observe only necessary parts of the DOM
observer.observe(document.body, { childList: true, subtree: true });

// Run the initial check and start the observer
processPageUrls();
