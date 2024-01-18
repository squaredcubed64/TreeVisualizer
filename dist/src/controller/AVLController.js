var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import AVLModel from "../model/AVLModel";
import AVLView from "../view/AVLView";
import BSTController from "./BSTController";
/**
 * The controller for the AVL tree. It is responsible for translating the model's return types into the view's parameter types
 */
var AVLController = /** @class */ (function (_super) {
    __extends(AVLController, _super);
    function AVLController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.model = new AVLModel(_this);
        _this.view = new AVLView(_this);
        return _this;
    }
    AVLController.prototype.translateInsertionInformation = function (modelInsertionInformation) {
        var translatedModelInsertionInformation = _super.prototype.translateInsertionInformation.call(this, modelInsertionInformation);
        var translatedRotationPath = this.translateRotationPath(modelInsertionInformation.rotationPath);
        return __assign(__assign({}, translatedModelInsertionInformation), { rotationPath: translatedRotationPath });
    };
    AVLController.prototype.translateDeletionInformation = function (modelDeletionInformation) {
        var translatedModelDeletionInformation = _super.prototype.translateDeletionInformation.call(this, modelDeletionInformation);
        var translatedRotationPath = this.translateRotationPath(modelDeletionInformation.rotationPath);
        return __assign(__assign({}, translatedModelDeletionInformation), { rotationPath: translatedRotationPath });
    };
    AVLController.prototype.translateRotationPath = function (rotationPath) {
        var _this = this;
        return rotationPath.map(function (rotationPathInstruction) {
            return _this.translateRotationPathInstruction(rotationPathInstruction);
        });
    };
    AVLController.prototype.translateRotationPathInstruction = function (rotationPathInstruction) {
        var node = rotationPathInstruction.node, shapesAfterRotation = rotationPathInstruction.shapesAfterRotation, secondaryDescription = rotationPathInstruction.secondaryDescription;
        return {
            node: this.translateNode(node),
            shapesAfterRotation: this.translateShapesAfterRotation(shapesAfterRotation),
            secondaryDescription: secondaryDescription,
        };
    };
    AVLController.prototype.translateShapesAfterRotation = function (shapesAfterRotation) {
        var _this = this;
        return shapesAfterRotation.map(function (shape) {
            return _this.translateShape(shape);
        });
    };
    return AVLController;
}(BSTController));
export default AVLController;
//# sourceMappingURL=AVLController.js.map