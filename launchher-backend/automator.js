const { chromium } = require('playwright');

/**
 * Simulates the AI navigating a portal and filling out a form.
 * @param {Object} userData - The data parsed by Gemini (Name, Aadhaar, etc.)
 * @param {Function} emit - The callback to broadcast SSE updates to the frontend
 */
async function runAutomation(userData, emit) {
    emit({ step: 'booting', message: 'Initializing secure browser environment...' });
    
    // NOTE: Set headless: false while testing locally so you can watch it work!
    const browser = await chromium.launch({ headless: false }); 
    const page = await browser.newPage();

    try {
        // 1. Navigate to the portal
        emit({ step: 'navigating', message: 'Connecting to Udyam Registration Portal...' });
        await page.goto('https://example.com'); // We will replace this with the real URL
        await page.waitForTimeout(1500); // Artificial delay for the demo effect

        // 2. Simulate typing the Name
        emit({ step: 'typing', field: 'Business Name', value: userData.businessName });
        // await page.fill('#business-name-input', userData.businessName); // Real code
        await page.waitForTimeout(1000);

        // 3. Simulate typing the Category
        emit({ step: 'typing', field: 'NIC Code', value: userData.nicCode });
        // await page.fill('#nic-code-input', userData.nicCode); // Real code
        await page.waitForTimeout(1000);

        // 4. Success State
        emit({ step: 'complete', message: 'Draft saved successfully. Awaiting user OTP.' });

    } catch (error) {
        console.error("Automation failed:", error);
        emit({ step: 'error', message: 'Failed to complete form.' });
    } finally {
        await browser.close();
    }
}

module.exports = { runAutomation };