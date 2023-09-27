import Dexie from "dexie";
import {getMockValue} from "./mock";
import randomWords from 'random-words';

class Db extends Dexie {
    attachments!: Dexie.Table<IAttachment, string>;

    constructor() {
        super("attachments");
        this.version(1).stores({
            attachments: 'src'
        });
    }
}


interface IAttachment {
    src: string,
    value: Blob,
}

export const db = new Db();


db.open();

export const saveAttachment = async (src: string, value: Blob) => {
    return db.transaction('rw', db.attachments, function () {
        db.attachments.bulkPut([{
            src,
            value
        },
        ])
    })
}

export const getAttachment = async (src: string) => {
    const res = await db.attachments.where('src').equals(src).toArray();
    return res[0];
}
