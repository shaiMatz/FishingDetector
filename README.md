# Phishing Detection and Reporting System

## Project Overview

This project implements a Phishing Detection and Reporting System designed to identify potentially dangerous URLs and allow users to report suspicious links. It utilizes the Google Safe Browsing API to check URLs against Google's list of known threats and provides users with visual warnings and the ability to report suspicious URLs to Google.

## Features

- **Phishing Detection**: Automatically scans URLs on a webpage to detect potentially dangerous links using the Google Safe Browsing API.
- **User Warnings**: Flags suspicious URLs by changing the link color to red and displaying a warning tooltip on hover.
- **Reporting Mechanism**: Allows users to report suspicious URLs directly to Google through a simple button click.
- **User Interaction**: Provides a user-friendly interface for interacting with the detection system, including visual indicators and feedback.

## Technologies Used

- **JavaScript**: Core programming language for the detection and reporting logic.
- **Google Safe Browsing API**: Used to check URLs against a known list of threats.
- **HTML/CSS**: For structuring and styling the user interface.

## Installation

To set up and run the project locally, follow these steps:

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/shaiMatz/FishingDetector.git
    cd FishingDetector
    ```

2. **Set Up Google Safe Browsing API**:
   - Obtain an API key from Google Safe Browsing.
   - Replace the placeholder `API_KEY` in the code with your actual API key.

3. **Install the Browser Extension**:
   - Open Google Chrome and navigate to `chrome://extensions/`.
   - Enable **Developer mode** by toggling the switch in the upper right corner.
   - Click on **Load unpacked**.
   - Select the folder containing your project files (where the `manifest.json` file is located).
   - The extension should now be installed and visible in your Chrome extensions list.

4. **Test the Project**:
   - To test the phishing detection system, visit [Google Safe Browsing Test Page](https://testsafebrowsing.appspot.com/).
   - This page contains various test scenarios that will trigger the phishing and malware warnings.

## Usage

### Automatic Detection
- **Automatic Detection**: URLs on the webpage are automatically scanned for phishing or malware.
- **Report Suspicious Links**: Click the "Report" button next to any flagged URL to report it to Google.

### Using `index.html` for Systematic Testing

The `index.html` file is designed to facilitate the systematic testing of the Phishing Detection and Reporting System using a CSV file of URLs. This file automates the process of feeding URLs to the Chrome extension and collecting results for analysis.

#### Steps to Use `index.html`:

1. **Prepare Your Dataset**:
   - Ensure you have a CSV file (`dataset_phishing.csv`) containing the URLs you want to test. The CSV should be formatted with the URLs in one column and corresponding labels (e.g., phishing, legitimate) in another.

2. **Open `index.html`**:
   - Open Google Chrome and navigate to the directory where the project is located.
   - Double-click on `index.html` or open it in Chrome by dragging the file into a new tab.

3. **Upload the CSV File**:
   - On the `index.html` page, you’ll see an interface prompting you to upload a CSV file.
   - Click the "Choose File" button and select your `dataset_phishing.csv` file.

4. **Start the Test**:
   - Once the file is uploaded, the testing process will begin automatically.
   - The system will use the Chrome extension to check each URL against the Google Safe Browsing API.

5. **View Results**:
   - After the test completes, the results (e.g., accuracy, precision, recall, F1 score) will be displayed directly on the page.
   - These metrics are calculated by comparing the detection results from the Chrome extension against the labels in the dataset.

6. **Analyze Results**:
   - Use the results to evaluate the performance of the Phishing Detection and Reporting System.
   - The page also allows you to download the results for further analysis.

### Example of Running a Test:

1. Upload the CSV file containing phishing and legitimate URLs.
2. The system will automatically process each URL and display whether it was flagged as phishing or not.
3. Results such as accuracy, precision, recall, and F1 score will be displayed after all URLs have been processed.

## Contributing

If you'd like to contribute to this project:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add a new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google Safe Browsing API for providing the URL scanning service.
- Shai Matzliach for project development.

## Contact

For any questions or suggestions, feel free to contact me at [Shaimatz99@gmail.com].
