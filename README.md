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

- **Automatic Detection**: URLs on the webpage are automatically scanned for phishing or malware.
- **Report Suspicious Links**: Click the "Report" button next to any flagged URL to report it to Google.

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

