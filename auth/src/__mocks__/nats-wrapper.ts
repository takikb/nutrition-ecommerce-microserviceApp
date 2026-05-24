export const natsWrapper = {
    client: {
        publish: jest.fn().mockImplementation(
            (subject: string, data: string, callback: (err: Error | null) => void) => {
                callback(null); // Simulate successful publish by calling the callback with null error
            }
        )
    }
}