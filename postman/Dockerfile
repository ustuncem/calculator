FROM node:24-bookworm
RUN npm install --global postman-cli@1.74.0
COPY calculator.postman_collection.json verify.sh /suite/
WORKDIR /work
ENTRYPOINT ["sh", "/suite/verify.sh"]
