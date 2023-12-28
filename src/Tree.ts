import DisplayNode from './DisplayNode';
import DataNode from './DataNode';

export default interface Tree {
    insert(value: number): void;
    remove(value: number): void;
    find(value: number): DisplayNode | null;
}