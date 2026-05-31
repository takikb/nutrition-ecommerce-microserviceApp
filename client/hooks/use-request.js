import axios from 'axios';
import { useState } from 'react';

export default function useRequest({ url, method, body, onSuccess }) {
    const [errors, setErrors] = useState(null);

    const doRequest = async (props = {}) => {
        try {
            setErrors(null);
            const response = await axios[method](url, { ...body, ...props });

            if (onSuccess) {
                onSuccess(response.data);
            }

            return response.data;
        } catch (err) {
            // Defensive extraction to prevent crashing on HTML errors or network drops [4]
            const errorList = err.response?.data?.errors;

            if (Array.isArray(errorList)) {
                // Render custom JSON validation errors from your backend express-validators
                setErrors(
                    <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mt-4 animate-enter">
                        <div className="flex items-center gap-2 font-bold text-sm mb-1.5">
                            <span className="material-symbols-outlined text-sm">error</span>
                            Ooops.... Something went wrong
                        </div>
                        <ul className="list-disc pl-5 text-xs space-y-1 font-medium">
                            {errorList.map((e, index) => (
                                <li key={index}>{e.message}</li>
                            ))}
                        </ul>
                    </div>
                );
            } else {
                // Fallback for raw HTML gateway errors (e.g., 502 Bad Gateway) or network failures [4]
                const fallbackMessage = err.response?.status 
                    ? `HTTP Error ${err.response.status}: ${err.response.statusText || "Interface Offline"}` 
                    : err.message || "A network or connection error occurred.";

                setErrors(
                    <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mt-4 animate-enter">
                        <div className="flex items-center gap-2 font-bold text-sm mb-1.5">
                            <span className="material-symbols-outlined text-sm">error</span>
                            Network or Gateway Error
                        </div>
                        <p className="text-xs font-medium pl-1 leading-relaxed">{fallbackMessage}</p>
                        <p className="text-[10px] text-red-600/70 pl-1 mt-1 font-mono">
                            Path: [{method.toUpperCase()}] {url}
                        </p>
                    </div>
                );
            }
        }
    };

    return { doRequest, errors };
}