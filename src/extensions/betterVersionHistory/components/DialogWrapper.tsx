import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog } from '@microsoft/sp-dialog';

export default class DialogWrapper<T> extends BaseDialog {
    private element: React.FunctionComponentElement<T> = null;

    constructor(element: React.FunctionComponentElement<T>) {
        super({ isBlocking: false });
        this.element = element;
    }

    public render(): void {
        ReactDOM.render(this.element, this.domElement);
    }

    public close(): Promise<void> {
        return super.close().then(() => {
            ReactDOM.unmountComponentAtNode(this.domElement);
        });
    }
}
