{
  "type": "object",
    "any_of": [
      {
        "type": "object",
        "properties": {
          "variable": {
            "enum": [
              "VARIABLE_1"
            ],
            "type": "string"
          },
          "value": {
            "enum": [
              "ABC",
              "DEF"
            ],
            "type": "string"
          }
        }
      },
      {
        "type": "object",
        "properties": {
          "variable": {
            "enum": [
              "VARIABLE_2"
            ],
            "type": "string"
          },
          "value": {
            "enum": [
              "GHI",
              "JKL"
            ],
            "type": "string"
          }
        }
      }
    ]
}






{
  "type": "object",
    "properties": {
    "interaction": {
      "type": "array",
        "items": {
        "type": "object",
          "any_of": [
            {
              "type": "object",
              "properties": {
                "actionName": {
                  "type": "string",
                  "enum": [
                    "Walk to object"
                  ]
                },
                "seedlingId": {
                  "type": "integer"
                },
                "targetId": {
                  "type": "integer"
                }
              },
              "required": [
                "actionName",
                "seedlingId",
                "targetId"
              ]
            },
            {
              "type": "object",
              "properties": {
                "actionName": {
                  "type": "string",
                  "enum": [
                    "Walk to Seedling"
                  ]
                },
                "seedlingId": {
                  "type": "integer"
                },
                "targetId": {
                  "type": "integer"
                }
              },
              "required": [
                "actionName",
                "seedlingId",
                "targetId"
              ]
            }
          ]
      }
    }
  },
  "required": [
    "interaction"
  ]
}






{
  "type": "object",
    "anyOf": [
      {
        "type": "object",
        "properties": {
          "highLevelSummary": {
            "type": "string",
            "description": "High level summary of the relative positioning of the interaction Seedlings, the non-interaction Seedlings, and the objects in the room. This must not exceed 100 words"
          },
          "dataPointsAndReasoning": {
            "type": "string",
            "description": "The picked interesting data points and your reasoning. This must not exceed 200 words"
          },
          "interaction": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "actionName": {
                  "type": "string",
                  "enum": [
                    "Walk to object"
                  ]
                },
                "seedlingId": {
                  "type": "integer"
                },
                "targetId": {
                  "type": "integer"
                }
              },
              "required": [
                "actionName",
                "seedlingId",
                "targetId"
              ]
            }
          }
        },
        "required": [
          "highLevelSummary",
          "dataPointsAndReasoning",
          "interaction"
        ]
      },
      {
        "type": "object",
        "properties": {
          "highLevelSummary": {
            "type": "string",
            "description": "High level summary of the relative positioning of the interaction Seedlings, the non-interaction Seedlings, and the objects in the room. This must not exceed 100 words"
          },
          "dataPointsAndReasoning": {
            "type": "string",
            "description": "The picked interesting data points and your reasoning. This must not exceed 200 words"
          },
          "interaction": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "actionName": {
                  "type": "string",
                  "enum": [
                    "Walk to Seedling"
                  ]
                },
                "seedlingId": {
                  "type": "integer"
                },
                "targetId": {
                  "type": "integer"
                }
              },
              "required": [
                "actionName",
                "seedlingId",
                "targetId"
              ]
            }
          }
        },
        "required": [
          "highLevelSummary",
          "dataPointsAndReasoning",
          "interaction"
        ]
      }
    ]
}