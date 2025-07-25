function createErrorMessage(option, xhr) {
    const msg = `Failed to ${option.method} ${option.action}: ${xhr.status} - ${xhr.statusText}`;
    const err = new Error(msg);
    err.status = xhr.status;
    err.method = option.method;
    err.url = option.action;
    return err;
  }
  
  function parseResponseBody(xhr) {
    const responseText = xhr.responseText || xhr.response;
    if (!responseText) {
      return null;
    }
    try {
      return JSON.parse(responseText);
    } catch {
      return responseText;
    }
  }
  
  export default function upload(option) {
    const xhr = new XMLHttpRequest();
  
    // Monitor upload progress
    if (option.onProgress && xhr.upload) {
      xhr.upload.onprogress = function (e) {
        if (e.total > 0) {
          e.percent = (e.loaded / e.total) * 100;
        }
        option.onProgress(e);
      };
    }
  
    const formData = new FormData();
  
    // Append additional data to the form
    if (option.data) {
      Object.entries(option.data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => formData.append(`${key}[]`, item));
        } else {
          formData.append(key, value);
        }
      });
    }
  
    // Append file to the form
    if (option.file instanceof Blob) {
      formData.append(option.filename, option.file, option.file.name);
    } else {
      formData.append(option.filename, option.file);
    }
  
    // Handle errors
    xhr.onerror = (e) => {
      option.onError(e);
    };
  
    // Handle upload success
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        return option.onError(createErrorMessage(option, xhr), parseResponseBody(xhr));
      }
      return option.onSuccess(parseResponseBody(xhr), xhr);
    };
  
    // Set a timeout (optional)
    if (option.timeout) {
      xhr.timeout = option.timeout;
      xhr.ontimeout = () => {
        const error = new Error(`Request timed out after ${option.timeout}ms`);
        option.onError(error);
      };
    }
  
    xhr.open(option.method, option.action, true);
  
    // Set credentials for cross-origin requests
    if (option.withCredentials) {
      xhr.withCredentials = true;
    }
  
    // Set custom headers
    const headers = option.headers || {};
    if (headers['X-Requested-With'] !== null) {
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    }
    Object.entries(headers).forEach(([key, value]) => {
      if (value !== null) {
        xhr.setRequestHeader(key, value);
      }
    });
  
    // Send the request
    xhr.send(formData);
  
    // Return abort function
    return {
      abort: () => {
        xhr.abort();
      },
    };
  }
