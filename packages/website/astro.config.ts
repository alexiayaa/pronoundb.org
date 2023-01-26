/*
 * Copyright (c) Cynthia Rey et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import fastify from '@matthewp/astro-fastify'

// If vars don't exist in the build's env, secrets are inlined.
// Since I don't want any of the env to be inlined in production, I load everything them with dotenv.
import dotenv from 'dotenv'
dotenv.config()

export default defineConfig({
  site: 'https://pronoundb.org',
  output: 'server',
  integrations: [ tailwind() ],
  // Fastify adapter does NOT work in dev, and causes hard dev server crash.
  // It is unable to resolve imports I do in `api.ts`... Oh well. I'll file a bug report eventually.
  adapter: process.env.NODE_ENV !== 'development'
    ? fastify({
      entry: new URL('./src/server/api.ts', import.meta.url),
      logger: { level: 'warn' },
    })
    : void 0 as any,
  vite: {
    resolve: {
      alias: {
        // The Fastify adapter does include @fastify/static, except I don't want it.
        // So I short-circuit it with this noop "plugin"...
        '@fastify/static': new URL('./src/server/noop.ts', import.meta.url).pathname,
      },
    },
    build: {
      // I don't like inlined assets
      assetsInlineLimit: 0,
      rollupOptions: {
        external: [ 'fastify' ],
      },
    },
  },
})
