import { IHttpOperation, INodeExample } from '@stoplight/types';
import { flatMap } from 'lodash';
import { HttpMocker } from '../../mocker';
import * as JSONSchemaGenerator from '../../mocker/generator/JSONSchema';
import helpers from '../negotiator/NegotiatorHelpers';

describe('HttpMocker', () => {
  const httpMocker = new HttpMocker(JSONSchemaGenerator.generate);

  afterEach(() => jest.restoreAllMocks());

  describe('mock()', () => {
    const mockSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        surname: { type: 'string', format: 'email' },
      },
      required: ['name', 'email'],
    };

    const mockResource: IHttpOperation = {
      id: 'id',
      method: 'get',
      path: '/test',
      servers: [],
      security: [],
      request: {
        headers: [],
        query: [],
        cookie: [],
        path: [],
      },
      responses: [
        {
          code: '200',
          headers: [],
          contents: [
            {
              mediaType: 'application/json',
              schema: mockSchema,
              examples: [
                {
                  key: 'preferred key',
                  value: 'hello',
                },
                {
                  key: 'test key',
                  value: 'test value',
                },
                {
                  key: 'test key2',
                  externalValue: 'http://example.org/examples/example1',
                },
              ],
              encodings: [],
            },
          ],
        },
      ],
    };

    const mockInput = {
      validations: {
        input: [],
      },
      data: {
        method: 'get' as const,
        url: {
          path: '/test',
          baseUrl: 'example.com',
        },
      },
    };

    it('fails when called with no resource', () => {
      return expect(
        httpMocker.mock({
          input: mockInput,
        }),
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it('fails when called with no input', () => {
      return expect(
        httpMocker.mock({
          resource: mockResource,
        }),
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    describe('with valid negotiator response', () => {
      it('returns an empty body when negotiator did not resolve to either example nor schema', () => {
        jest
          .spyOn(helpers, 'negotiateOptionsForValidRequest')
          .mockReturnValue({ code: '202', mediaType: 'test', headers: [] });

        return expect(
          httpMocker.mock({
            resource: mockResource,
            input: mockInput,
          }),
        ).resolves.toHaveProperty('body', undefined);
      });

      it('returns static example', () => {
        jest.spyOn(helpers, 'negotiateOptionsForValidRequest').mockReturnValue({
          code: '202',
          mediaType: 'test',
          bodyExample: mockResource.responses![0].contents![0].examples![0],
          headers: [],
        });

        return expect(
          httpMocker.mock({
            resource: mockResource,
            input: mockInput,
          }),
        ).resolves.toMatchSnapshot();
      });

      it('returns dynamic example', async () => {
        jest.spyOn(helpers, 'negotiateOptionsForValidRequest').mockReturnValue({
          code: '202',
          mediaType: 'test',
          schema: mockResource.responses![0].contents![0].schema,
          headers: [],
        });

        const response = await httpMocker.mock({
          resource: mockResource,
          input: mockInput,
        });

        return expect(response.body).toMatchObject({
          name: expect.any(String),
          surname: expect.any(String),
        });
      });
    });

    describe('with invalid negotiator response', () => {
      it('returns static example', () => {
        jest.spyOn(helpers, 'negotiateOptionsForInvalidRequest').mockReturnValue({
          code: '202',
          mediaType: 'test',
          bodyExample: mockResource.responses![0].contents![0].examples![0],
          headers: [],
        });

        return expect(
          httpMocker.mock({
            resource: mockResource,
            input: Object.assign({}, mockInput, { validations: { input: [{}] } }),
          }),
        ).resolves.toMatchSnapshot();
      });
    });

    describe('when example is of type INodeExternalExample', () => {
      it('generates a dynamic example', () => {
        jest.spyOn(helpers, 'negotiateOptionsForValidRequest').mockReturnValue({
          code: '202',
          mediaType: 'test',
          bodyExample: mockResource.responses![0].contents![0].examples![1],
          headers: [],
          schema: { type: 'string' },
        });

        jest.spyOn(JSONSchemaGenerator, 'generate').mockResolvedValue('example value chelsea');

        return expect(
          httpMocker.mock({
            resource: mockResource,
            input: mockInput,
          }),
        ).resolves.toMatchSnapshot();
      });
    });

    describe('when an example is defined', () => {
      describe('and dynamic flag is true', () => {
        describe('should generate a dynamic response', () => {
          const generatedExample = { hello: 'world' };

          beforeAll(() => {
            jest.spyOn(JSONSchemaGenerator, 'generate').mockResolvedValue(generatedExample);
          });

          afterAll(() => {
            jest.restoreAllMocks();
          });

          it('the dynamic response should not be an example one', async () => {
            const response = await httpMocker.mock({
              input: mockInput,
              resource: mockResource,
              config: { mock: { dynamic: true } },
            });

            expect(JSONSchemaGenerator.generate).not.toHaveBeenCalled();
            expect(response.body).toBeDefined();

            const allExamples = flatMap(mockResource.responses, res =>
              flatMap(res.contents, content => content.examples),
            ).map(x => {
              if ('value' in x) return x.value;
            });

            allExamples.forEach(example => expect(response.body).not.toEqual(example));
            expect(response.body).toMatchObject({
              name: expect.any(String),
              surname: expect.any(String),
            });
          });
        });
      });

      describe('and dynamic flag is false', () => {
        describe('and the example has been explicited', () => {
          it('should return the selected example', async () => {
            const response = await httpMocker.mock({
              input: mockInput,
              resource: mockResource,
              config: { mock: { dynamic: true, exampleKey: 'test key' } },
            });

            expect(response.body).toBeDefined();

            const selectedExample = flatMap(mockResource.responses, res =>
              flatMap(res.contents, content => content.examples),
            ).find(ex => ex.key === 'test key');

            expect(selectedExample).toBeDefined();
            expect(response.body).toEqual((selectedExample as INodeExample).value);
          });
        });
      });
    });
  });
});
