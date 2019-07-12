import TagModel from './tag';
import FileModel from './file';

const instances = new Map();

type ModelInst = TagModel | FileModel;

interface Model {
    new (...args: any[]): ModelInst
}

function getInstance<T>(model: { new (...args: any[]): T }, ...args: any[]): T {
    if (!instances.get(model)) {
        instances.set(model, new model(args));
    }
    return instances.get(model);
}

function delInstance(model: Model) {
    try {
        instances.delete(model);
    } catch (err) {
        console.log(err); // eslint-disable-line
    }
}

export default {
    getInstance,
    delInstance
};
