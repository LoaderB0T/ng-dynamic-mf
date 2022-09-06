export type HtmlHeadElementType = 'link' | 'script';

export type AddHtmlHeadElementType =
  | {
      type: 'link';
      rel: string;
      href: string;
    }
  | {
      type: 'script';
      src: string;
      crossorigin?: string;
    };
