/**
 * PDF Utilities
 *
 * Utility functions for working with PDF files in the browser.
 */
import * as pdfjsLib from 'pdfjs-dist'
/**
 * Extracts text content from a PDF file
 * @param {File} file - The PDF file to extract text from
 * @returns {Promise<string>} - The extracted text content
 */
pdfjsLib.GlobalWorkerOptions.workerSrc = '/node_modules/pdfjs-dist/build/pdf.worker.mjs'

export const extractTextFromPdf = async (file) => {
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
        reader.onload = async (e) => {
            try {
                const pdfData = new Uint8Array(e.target.result)
                const pdfDoc = await pdfjsLib.getDocument(pdfData).promise
                const totalPages = pdfDoc.numPages

                let textContent = ''

                // Create an array of promises for each page
                const pagePromises = []

                for (let i = 1; i <= totalPages; i++) {
                    pagePromises.push(pdfDoc.getPage(i).then(async page => {
                        const text = await page.getTextContent()
                        return text.items.map(item => item.str).join(' ')
                    }))
                }

                // Wait for all pages to be processed
                const allText = await Promise.all(pagePromises)

                // Combine all pages' text
                textContent = allText.join('\n')

                resolve(textContent)
            } catch (error) {
                reject(error)
            }
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsArrayBuffer(file)
    })
}

/**
 * Validates a PDF file
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSize - Maximum file size in bytes (default: 10MB)
 * @returns {Object} - Validation result { isValid: boolean, error?: string }
 */
export const validatePDFFile = (file, options = {}) => {
    const { maxSize = 10 * 1024 * 1024 } = options // 10MB default

    if (!file) {
        return { isValid: false, error: 'No file provided' }
    }

    if (file.type !== 'application/pdf') {
        return { isValid: false, error: 'Please select a PDF file' }
    }

    if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024))
        return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` }
    }

    return { isValid: true }
}