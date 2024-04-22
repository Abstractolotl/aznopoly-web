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

ENV NODE_ENV=production
RUN yarn build
COPY assets dist/assets

FROM nginx:alpine AS release
# Configure Nginx
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*
# Copy the built app to the html directory
COPY --from=install /temp/dev/node_modules /usr/share/nginx/html/node_modules
COPY --from=prerelease /app/dist/* /usr/share/nginx/html/
COPY --from=prerelease /app/dist/assets /usr/share/nginx/html/assets
COPY --from=prerelease /app/package.json /usr/share/nginx/html/

EXPOSE 8080
ENTRYPOINT ["nginx", "-g", "daemon off;"]