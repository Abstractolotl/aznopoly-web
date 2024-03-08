FROM node:lts as base
WORKDIR /app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base as install
RUN mkdir -p /temp/dev
COPY package.json yarn.lock /temp/dev/
RUN cd /temp/dev && yarn

# copy project files and folders to the current working directory (i.e. 'app' folder)
FROM install AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
RUN node bump-build-version.js

ENV NODE_ENV=production
RUN yarn build
COPY assets dist/assets

FROM base AS release
COPY --from=install /temp/dev/node_modules node_modules
COPY --from=prerelease /app/dist/* ./dist
COPY --from=prerelease /app/dist/assets ./dist/assets
COPY --from=prerelease /app/package.json .
RUN yarn global add http-server

EXPOSE 8080
CMD [ "http-server", "dist" ]