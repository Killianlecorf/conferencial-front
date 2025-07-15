const request = async (url: string, method: string, bodyContent?: any): Promise<any> => {
    try {
        let options: RequestInit = {
            method,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (method !== 'GET' && method !== 'DELETE') {
            options.body = JSON.stringify(bodyContent);
        }

        const response = await fetch(path + url, options);

        let sentResponse: {
            ok: boolean;
            status: number;
            message: string;
            data: any;
        } = {
            ok: response.ok,
            status: response.status,
            message: response.statusText,
            data: null
        };

        if (response.status === 200) {
            sentResponse.data = await response.json();
        }

        return sentResponse;
    } catch (error) {
        console.error(error);
        return {
            ok: false,
            status: 500,
            message: 'Error request',
            data: null
        };
    }
};

const path = 'http://localhost:8000/';

export default request;