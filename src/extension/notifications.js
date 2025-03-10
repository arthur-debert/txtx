const vscode = require("vscode");

/**
 * Notification configuration
 * Controls which notifications are actually sent
 * Default is false (no notifications during normal usage)
 * Tests can override this configuration
 */
const notificationConfig = {
    // Format Commands
    FORMAT_RFC_ONLY: false,
    FORMAT_NO_EDITOR: false,
    FORMAT_ERROR: false,
    FORMAT_SUCCESS: false,
    
    // TOC Commands
    TOC_RFC_ONLY: false,
    TOC_NO_EDITOR: false,
    TOC_NO_SECTIONS: false,
    TOC_SUCCESS: false,
    TOC_ERROR: false,
    
    // Full Formatting Commands
    FULL_FORMAT_RFC_ONLY: false,
    FULL_FORMAT_NO_EDITOR: false,
    FULL_FORMAT_SUCCESS: false,
    FULL_FORMAT_ERROR: false,
    
    // Footnote Commands
    FOOTNOTE_RFC_ONLY: false,
    FOOTNOTE_NO_EDITOR: false,
    FOOTNOTE_SUCCESS: false,
    FOOTNOTE_ERROR: false,
    FOOTNOTE_TXTDOC_ONLY: false,
    
    // Reference Commands
    REFERENCE_RFC_ONLY: false,
    REFERENCE_NO_EDITOR: false,
    REFERENCE_NONE_FOUND: false,
    REFERENCE_ALL_VALID: false,
    REFERENCE_INVALID_FOUND: false,
    REFERENCE_ERROR: false
};

/**
 * Notification definitions
 * Maps notification IDs to their properties
 */
const notifications = {
    // Format Commands
    FORMAT_RFC_ONLY: {
        type: "warning",
        message: "Format Document command is only available for .rfc files"
    },
    FORMAT_NO_EDITOR: {
        type: "error",
        message: "No active editor found"
    },
    FORMAT_ERROR: {
        type: "error",
        message: (error) => `Error formatting document: ${error.message}`
    },
    FORMAT_SUCCESS: {
        type: "info",
        message: "Document formatted successfully"
    },
    
    // TOC Commands
    TOC_RFC_ONLY: {
        type: "warning",
        message: "Generate TOC command is only available for .rfc files"
    },
    TOC_NO_EDITOR: {
        type: "error",
        message: "No active editor found"
    },
    TOC_NO_SECTIONS: {
        type: "warning",
        message: "No sections found in the document"
    },
    TOC_SUCCESS: {
        type: "info",
        message: "Table of contents generated successfully"
    },
    TOC_ERROR: {
        type: "error",
        message: (error) => `Error generating table of contents: ${error.message}`
    },
    
    // Full Formatting Commands
    FULL_FORMAT_RFC_ONLY: {
        type: "warning",
        message: "Full Formatting command is only available for .rfc files"
    },
    FULL_FORMAT_NO_EDITOR: {
        type: "error",
        message: "No active editor found"
    },
    FULL_FORMAT_SUCCESS: {
        type: "info",
        message: "Full formatting applied successfully"
    },
    FULL_FORMAT_ERROR: {
        type: "error",
        message: (error) => `Error applying full formatting: ${error.message}`
    },
    
    // Footnote Commands
    FOOTNOTE_RFC_ONLY: {
        type: "warning",
        message: "Number Footnotes command is only available for .rfc files"
    },
    FOOTNOTE_NO_EDITOR: {
        type: "error",
        message: "No active editor found"
    },
    FOOTNOTE_SUCCESS: {
        type: "info",
        message: "Footnotes numbered successfully"
    },
    FOOTNOTE_ERROR: {
        type: "error",
        message: (error) => `Error numbering footnotes: ${error.message}`
    },
    FOOTNOTE_TXTDOC_ONLY: {
        type: "warning",
        message: "Number Footnotes command is only available for TxtDoc files"
    },
    
    // Reference Commands
    REFERENCE_RFC_ONLY: {
        type: "warning",
        message: "Check References command is only available for .rfc files"
    },
    REFERENCE_NO_EDITOR: {
        type: "error",
        message: "No active editor found"
    },
    REFERENCE_NONE_FOUND: {
        type: "info",
        message: "No document references found"
    },
    REFERENCE_ALL_VALID: {
        type: "info",
        message: "All references are valid"
    },
    REFERENCE_INVALID_FOUND: {
        type: "warning",
        message: (count) => `Found ${count} invalid references`
    },
    REFERENCE_ERROR: {
        type: "error",
        message: (error) => `Error checking references: ${error.message}`
    }
};

/**
 * Send a notification by ID
 * @param {string} id - The notification ID
 * @param {any} [param] - Optional parameter for dynamic messages
 * @returns {Promise<boolean>} - Whether the notification was sent
 */
function sendNotification(id, param) {
    // Check if this notification is enabled
    if (!notificationConfig[id]) {
        return false;
    }
    
    const notification = notifications[id];
    if (!notification) {
        console.error(`Unknown notification ID: ${id}`);
        return false;
    }
    
    let message = notification.message;
    if (typeof message === 'function') {
        message = message(param);
    }
    
    switch (notification.type) {
        case "info":
            vscode.window.showInformationMessage(message);
            break;
        case "warning":
            vscode.window.showWarningMessage(message);
            break;
        case "error":
            vscode.window.showErrorMessage(message);
            break;
        default:
            console.error(`Unknown notification type: ${notification.type}`);
            return false;
    }
    
    return true;
}

/**
 * Enable a specific notification
 * @param {string} id - The notification ID to enable
 */
function enableNotification(id) {
    if (notifications[id]) {
        notificationConfig[id] = true;
    }
}

/**
 * Disable a specific notification
 * @param {string} id - The notification ID to disable
 */
function disableNotification(id) {
    if (notifications[id]) {
        notificationConfig[id] = false;
    }
}

/**
 * Enable all notifications
 */
function enableAllNotifications() {
    Object.keys(notificationConfig).forEach(id => {
        notificationConfig[id] = true;
    });
}

/**
 * Disable all notifications
 */
function disableAllNotifications() {
    Object.keys(notificationConfig).forEach(id => {
        notificationConfig[id] = false;
    });
}

/**
 * Set notification configuration
 * @param {Object} config - Configuration object with notification IDs as keys
 */
function setNotificationConfig(config) {
    Object.keys(config).forEach(id => {
        if (notificationConfig.hasOwnProperty(id)) {
            notificationConfig[id] = !!config[id];
        }
    });
}

/**
 * Get the current notification configuration
 * @returns {Object} - The current notification configuration
 */
function getNotificationConfig() {
    return { ...notificationConfig };
}

/**
 * Get all notification IDs
 * @returns {string[]} - Array of all notification IDs
 */
function getNotificationIds() {
    return Object.keys(notifications);
}

module.exports = {
    sendNotification,
    enableNotification,
    disableNotification,
    enableAllNotifications,
    disableAllNotifications,
    setNotificationConfig,
    getNotificationConfig,
    getNotificationIds
};