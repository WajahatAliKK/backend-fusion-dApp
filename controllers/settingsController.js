// import { setQuickBuySettings, getQuickBuySettings, setQuickBuySettings as setQuickBuySettingsService, setQuickSellSettings as setQuickSellSettingsService } from '../services/settingsService.js';
import {
    getQuickBuySettings as getQuickBuySettingsService,
    getQuickSellSettings as getQuickSellSettingsService,
    setQuickBuySettings as setQuickBuySettingsService, // Renamed import
    setQuickSellSettings as setQuickSellSettingsService // Renamed import
} from '../services/settingsService.js';

export async function setQuickBuySettings(req, res) {
    try {
        // Extract necessary data from req.body
        const { publicAddress, slipPage, maxGasLimit, priorityFee, mevProtection, briberyAmount, customizedAmounts } = req.body;

        // Call the service function to save the settings
        const message = await setQuickBuySettingsService(publicAddress, slipPage, maxGasLimit, priorityFee, mevProtection, briberyAmount, customizedAmounts);

        // Respond with success message
        res.json({ success: true, message });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function getQuickBuySettings(req, res) {
    try {
        // Extract publicAddress from request parameters
        const { publicAddress } = req.params;

        // Call the service function to get settings
        const settings = await getQuickBuySettingsService(publicAddress);

        // Respond with settings
        res.json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function setQuickSellSettings(req, res) {
    try {
        // Extract necessary data from req.body
        const { publicAddress, slipPage, maxGasLimit, priorityFee, mevProtection, briberyAmount, customizedAmounts } = req.body;

        // Call the service function to save the settings
        const message = await setQuickSellSettingsService(publicAddress, slipPage, maxGasLimit, priorityFee, mevProtection, briberyAmount, customizedAmounts);

        // Respond with success message
        res.json({ success: true, message });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function getQuickSellSettings(req, res) {
    try {
        // Extract publicAddress from request parameters
        const { publicAddress } = req.params;

        // Call the service function to get settings
        const settings = await getQuickSellSettingsService(publicAddress);

        // Respond with settings
        res.json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
