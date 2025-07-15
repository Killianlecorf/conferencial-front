const request = async (url: string, method: string, bodyContent?: any): Promise<any> => {
  try {
    const options: RequestInit = {
      method,
      credentials: 'include',
      headers: {}
    };

    if (method !== 'GET' && bodyContent !== undefined) {
      options.headers = {
        'Content-Type': 'application/json'
      };
      options.body = JSON.stringify(bodyContent);
    }

    const response = await fetch(path + url, options);

    const sentResponse = {
      ok: response.ok,
      status: response.status,
      message: response.statusText,
      data: null as any
    };

  if (response.ok) {
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