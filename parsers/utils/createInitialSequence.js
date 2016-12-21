module.exports = function createInitialSequence(options) {
    options = options || {}
    return {
        messages: [],
        success: true,
        parsedSequence: {
            features: [],
            name: options.fileName || 'Untitled Sequence',
            sequence: ''
        }
    };
}
