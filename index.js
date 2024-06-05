const express = require('express');
const cors = require("cors");
const SwaggerParser = require("@apidevtools/swagger-parser");
const yaml = require('js-yaml');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json({limit: '50mb'}));

app.post('/api/openapi-validator', async (req, res) => {
  try {
    const { schema } = req.body;
    if (!schema) {
      return res.status(400).send(false);
    }

    const schemaObject = handleParse(schema);

    if(schemaObject && schemaObject.error) {
      return res.status(400).json(schemaObject);
    }

    if(!schemaObject || !(schemaObject.openapi || schemaObject.swagger)) {
      return res.status(400).json({
        "error": "Please enter a valid OpenAPI schema. (JSON or YAML)"
      });
    }

    if(schemaObject.openapi && schemaObject.openapi === "3.1.0") {
      return res.status(400).json({
        "error": "Right now, only versions 2.X and 3.0.X of OpenAPI are supported."
      });
    }

    const api = await SwaggerParser.validate(schemaObject);
    return res.status(200).send(api);
  } catch (err) {
    return res.status(500).json({"error": err.message});
  }
});

const handleParse = (value) => {
    try {
      const parsedData = JSON.parse(value);
      return parsedData;
    } catch (jsonError) {
      try {
        const parsedData = yaml.load(value);
        return parsedData;
      } catch (yamlError) {
        return {"error": yamlError.reason};
      }
    }
};

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});

