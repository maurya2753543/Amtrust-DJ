FROM nginx

## Remove default nginx config
##RUN rm -rf /etc/nginx/nginx.conf

## Copy our default config
##COPY nginx/nginx.conf /etc/nginx/

## Copy our nginx config
COPY nginx/default.conf /etc/nginx/conf.d/

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

COPY dist/scrm-fe /usr/share/nginx/html

EXPOSE 4000