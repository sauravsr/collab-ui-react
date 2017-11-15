import { FieldQuery, OperatorAnd, OperatorOr, SearchElement } from './searchElement';
import { SearchTranslator } from './searchTranslator';

class SearchElementBuilder {
  private searchElements: SearchElement[] = [];

  private isOrOperator = false;
  private previousOperatorWasOr = false;

  public add(e: SearchElement) {
    if (this.isOrOperator && !this.previousOperatorWasOr) {
      throw Error('Mixing and/or requires parenthesis');
    }
    this.searchElements.push(e);
    this.previousOperatorWasOr = false;
  }

  public setOperatorAnd() {
    if (this.isOrOperator) {
      throw Error('Mixing and/or requires parenthesis');
    }
  }

  public setOperatorOr() {
    if (!this.isOrOperator && this.searchElements.length > 1) {
      throw Error('Mixing and/or requires parenthesis');
    }
    this.isOrOperator = true;
    this.previousOperatorWasOr = true;
  }

  public createSearchElement(): SearchElement {

    if (this.searchElements.length === 1) {
      return this.searchElements[0];
    }

    if (this.isOrOperator) {
      return new OperatorOr(this.searchElements);
    } else {
      return new OperatorAnd(this.searchElements);
    }
  }
}

export class QueryParser {

  public static readonly Field_ErrorCodes = 'errorcodes';
  public static readonly Field_UpgradeChannel = 'upgradechannel';
  public static readonly Field_ActiveInterface = 'activeinterface';
  public static readonly Field_ConnectionStatus = 'connectionstatus';

  private static validFieldNames = ['displayname',
    'cisuuid',
    'accounttype',
    QueryParser.Field_ActiveInterface,
    'serial',
    'mac',
    'ip',
    'description',
    'productfamily',
    'software',
    QueryParser.Field_UpgradeChannel,
    'product',
    QueryParser.Field_ConnectionStatus,
    'sipurl',
    QueryParser.Field_ErrorCodes,
    'tags'];

  public constructor(private searchTranslator: SearchTranslator) {
  }

  public parseQueryString(queryString: string): SearchElement {
    return this.parseElement(queryString.toLowerCase());
  }

  private parseElement(expression: string, searchField?: string, queryType?: string): SearchElement {

    const builder = new SearchElementBuilder();
    let curIndex: number = 0;

    while (curIndex < expression.length) {
      curIndex += QueryParser.getLeadingWhiteSpaceCount(expression, curIndex);

      if (curIndex >= expression.length) {
        break;
      }
      const currentText: string = expression.slice(curIndex);

      if (QueryParser.startsPhrase(currentText)) {
        const endIndex = QueryParser.getQuotationEndIndex(currentText);
        builder.add(new FieldQuery(currentText.substring(1, endIndex).trim(), searchField, queryType));
        curIndex += endIndex + 1;
      } else if (QueryParser.startsParenthesis(currentText)) {
        const endIndex = QueryParser.getParenthesisEndIndex(currentText);
        builder.add(this.parseElement(currentText.substring(1, endIndex), searchField, queryType));
        curIndex += endIndex + 1;
      } else if (searchField == null && this.startsField(currentText)) {

        const fieldOperatorIndex = QueryParser.getOperatorIndex(currentText);
        const fieldQueryType = currentText[fieldOperatorIndex] === '=' ? FieldQuery.QueryTypeExact : undefined;
        const fieldName = this.getFieldName(currentText.substring(0, fieldOperatorIndex).trim());
        curIndex += fieldOperatorIndex + 1;
        curIndex += QueryParser.getLeadingWhiteSpaceCount(expression, curIndex);

        const currentFieldText = expression.substring(curIndex);

        if (QueryParser.startsPhrase(currentFieldText)) {
          const endIndex = QueryParser.getQuotationEndIndex(currentFieldText);
          builder.add(new FieldQuery(currentFieldText.substring(1, endIndex), fieldName, fieldQueryType));
          curIndex += endIndex + 1;
        } else if (QueryParser.startsParenthesis(currentFieldText)) {
          const endIndex = QueryParser.getParenthesisEndIndex(currentFieldText);
          builder.add(this.parseElement(currentFieldText.substring(1, endIndex), fieldName, fieldQueryType));
          curIndex += endIndex + 1;
        } else {
          //It's a term. Grab the first word
          const endIndex = QueryParser.getFirstWordEndIndex(currentFieldText);
          builder.add(new FieldQuery(currentFieldText.substring(0, endIndex), fieldName, fieldQueryType));
          curIndex += endIndex;
        }

      } else {
        const endIndex = QueryParser.getFirstWordEndIndex(currentText);
        const word = currentText.substring(0, endIndex);

        switch (word) {
          case 'or':
            builder.setOperatorOr();
            break;
          case 'and':
            builder.setOperatorAnd();
            break;
          default:
            builder.add(new FieldQuery(word, searchField, queryType));
            break;
        }
        curIndex += endIndex;
      }
    }
    return builder.createSearchElement();
  }

  private static getOperatorIndex(currentText: string): number {
    for (let i = 0; i < currentText.length; i++) {
      if (currentText[i] === '=' || currentText[i] === ':') {
        return i;
      }
    }
    throw new Error('Field operator not found in search string.');
  }

  public startsField(searchElement: string): boolean {

    const allowedFields = _.concat(QueryParser.validFieldNames, this.searchTranslator.getLocalizedFieldnames());

    return _.some(allowedFields, fieldName => _.startsWith(_.toLower(searchElement), _.toLower(fieldName)) &&
      (searchElement[fieldName.length] === ':' || searchElement[fieldName.length] === '='));
  }

  public getFieldName(field: string): string {
    if (_.some(QueryParser.validFieldNames, validField => _.isEqual(validField, _.toLower(field)))) {
      return _.toLower(field);
    }

    return this.searchTranslator.getFieldName(field);
  }

  private static getParenthesisEndIndex(currentText: string): number {
    let currentIndex = 0;
    let parenthesisStack = 0;
    while (parenthesisStack >= 0) {
      currentIndex++;

      if (currentIndex >= currentText.length) {
        throw new Error('Unfinished parenthesis');
      }

      const currentChar = currentText[currentIndex];

      if (currentChar === '(') {
        parenthesisStack++;
      } else if (currentChar === ')') {
        parenthesisStack--;
      }
    }
    return currentIndex;
  }

  private static startsParenthesis(currentText: string): boolean {
    return _.startsWith(currentText, '(');
  }

  private static getQuotationEndIndex(currentText: string): number {
    const endIndex = currentText.indexOf('\"', 1);
    if (endIndex < 0) {
      throw new Error('Unfinished quotation');
    }
    return endIndex;
  }

  private static getFirstWordEndIndex(currentText: string): number {
    const wordEnd = currentText.search(/\s|\(/);
    if (wordEnd < 0) {
      return currentText.length;
    }
    return wordEnd;
  }

  private static getLeadingWhiteSpaceCount(expression: string, start: number): number {
    let whiteSpaceCount: number = 0;
    while ((start + whiteSpaceCount) < expression.length && expression[start + whiteSpaceCount] === ' ') {
      whiteSpaceCount++;
    }
    return whiteSpaceCount;
  }

  private static startsPhrase(expression: string): boolean {
    return _.startsWith(expression, '"');
  }
}
