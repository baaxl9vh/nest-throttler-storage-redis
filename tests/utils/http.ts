import * as http from 'http';

export function request (
  url: string,
  ua?: string,
): Promise<{
  data: string;
  headers: http.IncomingHttpHeaders;
  status: number | undefined;
}> {
  return new Promise((resolve, reject) => {
    http
      .get(
        url,
        { headers: { 'user-agent': ua ? ua : 'default-ua' } },
        (res) => {
          const { statusCode } = res;
          if (statusCode !== 200) {
            const error = new Error(
              'Request Failed.\n' + `Status Code: ${statusCode}`,
            );
            console.error(error.message);
            res.resume();
            return;
          }
          res.setEncoding('utf8');
          let rawData = '';
          res.on('data', (chunk) => {
            rawData += chunk;
          });
          res.on('end', () => {
            try {
              resolve({
                data: rawData,
                headers: res.headers,
                status: res.statusCode,
              });
            } catch (e) {
              reject(e);
            }
          });
        },
      )
      .on('error', (error) => {
        reject(error);
      });
  });
}
