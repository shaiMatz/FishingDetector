const API_KEY = ''; // Your Google Safe Browsing API key
// Extract all URLs from the page
const urls = Array.from(document.querySelectorAll('a')).map(link => link.href);

// Function to canonicalize URLs
function canonicalizeUrl(url) {
    try {
        let urlObj = new URL(url, document.baseURI);  // Use document.baseURI for relative URLs

        // Normalize hostname
        urlObj.hostname = urlObj.hostname.toLowerCase();

        // Remove fragment
        urlObj.hash = '';

        // Percent-unescape the path
        while (urlObj.pathname.includes('%')) {
            try {
                urlObj.pathname = decodeURIComponent(urlObj.pathname);
            } catch (e) {
                // If decoding fails, just break the loop
                break;
            }
        }

        // Normalize path
        urlObj.pathname = urlObj.pathname.replace(/\/\.\//g, '/');
        urlObj.pathname = urlObj.pathname.replace(/\/\.$/, '/');

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

// Function to generate hash prefix based on the canonical URL
async function generateHashPrefix(canonicalUrl) {
    const encoder = new TextEncoder();
    const data = encoder.encode(canonicalUrl);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const truncatedHash = hashArray.slice(0, 4);
    return btoa(String.fromCharCode(...truncatedHash));  // Convert to base64
}

// Function to check URLs using Google Safe Browsing v5 API
async function checkUrlWithGoogleSafeBrowsing(url) {
    const canonicalUrl = canonicalizeUrl(url);

    if (!canonicalUrl) {
        return false;  // Skip checking if the URL is invalid
    }


    const requestBody = {
        client: {
            clientId: "your-client-id",
            clientVersion: "1.0"
        },
        threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [
                { url: canonicalUrl }
            ]
        }
    };

    try {
        const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.matches && data.matches.length > 0 ? true : false;
    } catch (error) {
        console.error('Error checking URL with Google Safe Browsing:', error.message);
        return false;  // Assume the URL is safe if the check fails
    }
}

// Function to show popup alert
function showPopup(url) {
    alert(`Warning: ${url} is potentially dangerous!`);
}

// Iterate through each URL and check if it's phishing
urls.forEach(async (url) => {
    const isPhishing = await checkUrlWithGoogleSafeBrowsing(url);
    if (isPhishing) {
        console.log(`Warning: ${url} is potentially dangerous!`);

        // Find the link element by iterating through all anchor tags
        const linkElements = document.querySelectorAll('a');
        let found = false;

        linkElements.forEach(linkElement => {
            // Normalize both the href in the DOM and the canonicalized URL for comparison
            const domUrl = canonicalizeUrl(linkElement.href);
            if (domUrl === canonicalizeUrl(url)) {
                // If a match is found, update the style and title
                linkElement.style.color = 'red';
                linkElement.style.textDecoration = 'underline'; // Make it obvious it's a warning
                linkElement.title = 'Warning: This link is potentially dangerous!';

                // Add a hover effect to change the text color or background
                linkElement.addEventListener('mouseover', () => {
                    linkElement.style.backgroundColor = 'yellow';
                });
                linkElement.addEventListener('mouseout', () => {
                    linkElement.style.backgroundColor = '';
                });

                // Create a report button next to the suspicious link
                const reportButton = document.createElement('button');
                reportButton.textContent = 'Report';
                reportButton.style.marginLeft = '10px';
                reportButton.style.backgroundColor = '#ff4d4d'; // Red color for emphasis
                reportButton.style.color = 'white';
                reportButton.style.border = 'none';
                reportButton.style.borderRadius = '3px';
                reportButton.style.cursor = 'pointer';

                // Add the report button next to the link
                linkElement.parentNode.insertBefore(reportButton, linkElement.nextSibling);

                // Add event listener to handle reporting
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
    console.log(`Checked URL: ${url}`);
});

// Function to handle reporting of suspicious links
function reportSuspiciousLink(url) {
    // Logic to report the link
    // For example, sending it to a server or logging it locally
    console.log(`Reporting suspicious link: ${url}`);
    reportSuspiciousLinkToGoogle(url);

    // Simulate a report being sent
}


function reportSuspiciousLinkToGoogle(url) {
    const googleReportUrl = `https://safebrowsing.google.com/safebrowsing/report_phish/?url=${encodeURIComponent(url)}`;
    window.open(googleReportUrl, '_blank'); // Opens the Google report page in a new tab
    alert(`Thank you! The suspicious link has been reported: ${url}`);
}

