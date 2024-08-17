const API_KEY = ''; // Your Google Safe Browsing API key
const checkedUrls = new Set(); // Track already checked URLs

// Function to canonicalize URLs
function canonicalizeUrl(url) {
    try {
        const urlObj = new URL(url, document.baseURI);  // Use document.baseURI for relative URLs

        // Normalize hostname and remove fragment
        urlObj.hostname = urlObj.hostname.toLowerCase();
        urlObj.hash = '';

        // Percent-unescape and normalize path
        try {
            urlObj.pathname = decodeURIComponent(urlObj.pathname).replace(/\/\.\//g, '/').replace(/\/\.$/, '/');
        } catch (e) {
            console.warn('Decoding failed, proceeding with original pathname.');
        }

        // Percent-escape necessary characters
        urlObj.pathname = urlObj.pathname.split('').map(c => {
            const code = c.charCodeAt(0);
            return (code <= 32 || code >= 127 || c === '#' || c === '%') ? '%' + code.toString(16).toUpperCase() : c;
        }).join('');

        return urlObj.href;
    } catch (error) {
        console.error('Invalid URL:', url);
        return null;  // Return null if the URL is invalid
    }
}

// Function to check URLs using Google Safe Browsing v5 API
async function checkUrlWithGoogleSafeBrowsing(url) {
    const canonicalUrl = canonicalizeUrl(url);

    if (!canonicalUrl || checkedUrls.has(canonicalUrl)) return false;  // Skip checking if the URL is invalid or already checked

    checkedUrls.add(canonicalUrl); // Add URL to the checked set

    const requestBody = {
        client: {
            clientId: "your-client-id",
            clientVersion: "1.0"
        },
        threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url: canonicalUrl }]
        }
    };

    try {
        await delay(500); // Delay to avoid rate limiting
        const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        return data.matches && data.matches.length > 0;
    } catch (error) {
        console.error('Error checking URL with Google Safe Browsing:', error.message);
        return false;  // Assume the URL is safe if the check fails
    }
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// Function to report suspicious links
function reportSuspiciousLink(url) {
    const googleReportUrl = `https://safebrowsing.google.com/safebrowsing/report_phish/?url=${encodeURIComponent(url)}`;
    window.open(googleReportUrl, '_blank'); // Opens the Google report page in a new tab
    alert(`Thank you! The suspicious link has been reported: ${url}`);
}

// Function to mark a URL as dangerous
function markUrlAsDangerous(linkElement) {
    linkElement.style.color = 'red';
    linkElement.style.textDecoration = 'underline'; // Make it obvious it's a warning
    linkElement.title = 'Warning: This link is potentially dangerous!';

    linkElement.addEventListener('mouseover', () => {
        linkElement.style.backgroundColor = 'yellow';
    });
    linkElement.addEventListener('mouseout', () => {
        linkElement.style.backgroundColor = '';
    });

    const reportButton = document.createElement('button');
    reportButton.textContent = 'Report';
    reportButton.style.cssText = 'margin-left: 10px; background-color: #ff4d4d; color: white; border: none; border-radius: 3px; cursor: pointer;';

    reportButton.addEventListener('click', () => reportSuspiciousLink(linkElement.href));
    linkElement.parentNode.insertBefore(reportButton, linkElement.nextSibling);
}

// Function to process and check URLs on the page
async function processPageUrls() {
    const urls = Array.from(document.querySelectorAll('a')).map(link => link.href).slice(0, 50);

    for (const url of urls) {
        const linkElement = document.querySelector(`a[href='${url}']`);
        const isPhishing = await checkUrlWithGoogleSafeBrowsing(url);
        if (isPhishing && linkElement) {
            console.log(`Warning: ${url} is potentially dangerous!`);
            markUrlAsDangerous(linkElement);
        }
        console.log(`Checked URL: ${url}`);
    }
}

// Initial check on page load
processPageUrls();

// Set up a MutationObserver to watch for new URLs being added
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.addedNodes) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeName === 'A') {
                    checkUrlWithGoogleSafeBrowsing(node.href).then(isPhishing => {
                        if (isPhishing) {
                            markUrlAsDangerous(node);
                        }
                    });
                } else if (node.querySelectorAll) {
                    const newLinks = node.querySelectorAll('a');
                    newLinks.forEach(link => {
                        checkUrlWithGoogleSafeBrowsing(link.href).then(isPhishing => {
                            if (isPhishing) {
                                markUrlAsDangerous(link);
                            }
                        });
                    });
                }
            });
        }
    });
});

// Start observing the document for changes
observer.observe(document.body, { childList: true, subtree: true });
