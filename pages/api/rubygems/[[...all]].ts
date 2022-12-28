import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxy from 'http-proxy';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    externalResolver: true,
  },
};

const target = 'https://index.rubygems.org';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  req.url = req?.url?.replace(/^\/api\/rubygems/, '');
  return new Promise(async (resolve, reject) => {
    if (process.env.STORE_CACHE) {
      const targetPath = req?.url || '';
      const dir = `./public/cache${path.dirname(targetPath)}`;
      const filename = decodeURIComponent(path.basename(targetPath).replace(/\?/g, '_'));

      fs.mkdirSync(dir, { recursive: true });
      const cache = await fetch(`${target}${targetPath}`);
      fs.writeFileSync(`${dir}/${filename}`, Buffer.from(await cache.arrayBuffer()));
    }

    const proxy: httpProxy = httpProxy.createProxy();
    proxy.once('proxyRes', resolve).once('error', reject).web(req, res, {
      changeOrigin: true,
      target,
    });
  });
};
