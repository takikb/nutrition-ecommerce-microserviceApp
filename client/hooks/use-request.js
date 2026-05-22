import axios from "axios";
import { useState } from "react";

export default ({ url, method, onSuccess }) => {
    const [errors, setErrors] = useState(null);

    const doRequest = async (body) => {
        try {
            setErrors(null);
            const response = await axios[method](url, body);

            if (onSuccess) {
                onSuccess(response.data);
            }
            
            return response.data;

        } catch (err) {
            setErrors(
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-sm">Ooops....</span>
                    </div>
                    <ul className="list-disc pl-5 text-xs space-y-1">
                        {err.response.data.errors.map(err => (
                            <li key={err.message} className="font-medium">{err.message}</li>
                        ))}
                    </ul>
                </div>
            );
        }
    }

    return {doRequest, errors};
};
