var fp = window.flatpickr;
var sffw;
(function (sffw) {
    var components;
    (function (components) {
        var listGrid2;
        (function (listGrid2) {
            'use strict';
            var handlers = ko.bindingHandlers;
            var fpChangeHandler = function (par, selectedDates, dateStr, instance) {
                if (par.att && par.element) {
                    par.att(selectedDates[0]);
                }
            };
            handlers.filterDatePicker = handlers.filterDatePicker || {
                init: function (element, valueAccessor) {
                    $(element).attr('autocomplete', 'off');
                    var att = valueAccessor();
                    var onChangePar = {
                        att: att,
                        element: element
                    };
                    var config = {
                        allowInput: true,
                        enableTime: false,
                        onChange: fpChangeHandler.bind(null, onChangePar)
                    };
                    if (window.sf.localization.currentCulture() && typeof (window.sf.localization.currentCulture().strToDate) === 'function') {
                        config.parseDate = window.sf.localization.currentCulture().strToDate;
                    }
                    var prepareFlatPickrCulture = function () {
                        if (currentCultureCode()) {
                            _.forOwn(window.sf.localization.currentCulture().flatpickrConfig, function (value, key) {
                                if (key !== 'dateFormat') {
                                    config[key] = value;
                                }
                                else {
                                    // remove time from dateFormat
                                    config[key] = value.toString().replace(' H:i', '');
                                }
                            });
                            var cultureConfig = config.l10ns;
                            fp.l10ns[currentCultureCode()] = cultureConfig;
                        }
                    };
                    var currentCultureCode = window.sf.localization.currentCultureCode;
                    if (currentCultureCode()) {
                        prepareFlatPickrCulture();
                        config.locale = currentCultureCode();
                    }
                    var flatpickr = new window.flatpickr(element, config);
                    var subscription = att.subscribe(function () {
                        if (att()) {
                            flatpickr.setDate(att());
                        }
                        else {
                            flatpickr.clear();
                        }
                    });
                    // set value to current attribute value
                    flatpickr.setDate(att() || null, true);
                    element.value = att();
                    ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                        subscription.dispose();
                        cultureChangeSubscription.dispose();
                        flatpickr.destroy();
                        att = null;
                        config = null;
                        flatpickr = null;
                    });
                    var cultureChangeSubscription = currentCultureCode.subscribe(function () {
                        prepareFlatPickrCulture();
                        flatpickr.set('locale', currentCultureCode());
                        flatpickr.set('dateFormat', config.dateFormat);
                        if (typeof (window.sf.localization.currentCulture().strToDate) === 'function') {
                            flatpickr.set('parseDate', window.sf.localization.currentCulture().strToDate);
                        }
                        flatpickr.setDate(att() || null, false);
                    });
                }
            };
            handlers.filterOptionHasFocus = handlers.filterOptionHasFocus || {
                init: function (element, valueAccessor) {
                    var att = valueAccessor();
                    $(element).on('focusin', function () {
                        att(true);
                    });
                    $(element).on('focusout', function () {
                        att(false);
                    });
                }
            };
            handlers.winsize = handlers.winsize || {
                init: function (element, valueAccessor) {
                    var resizeHandler = function () {
                        var value = valueAccessor();
                        value({ width: $(window).width(), height: $(window).height() });
                    };
                    $(window).on('resize', resizeHandler);
                    ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                        $(window).off('resize', resizeHandler);
                    });
                }
            };
        })(listGrid2 = components.listGrid2 || (components.listGrid2 = {}));
    })(components = sffw.components || (sffw.components = {}));
})(sffw || (sffw = {}));
var sffw;
(function (sffw) {
    var components;
    (function (components) {
        var listGrid2;
        (function (listGrid2) {
            var SelectOption = /** @class */ (function () {
                function SelectOption(value, text) {
                    this.value = value;
                    this.text = text;
                }
                return SelectOption;
            }());
            listGrid2.SelectOption = SelectOption;
            var hasFocusPropName = 'hasFocus';
            var ListGridColumnModel = /** @class */ (function () {
                function ListGridColumnModel(column, dc, maxVisibleFilterOptions, colDefIndex) {
                    var _this = this;
                    this.colDefIndex = colDefIndex;
                    this.localization = window.sf.localization;
                    this.filterText = ko.observable('');
                    this.isFilterActive = ko.observable(false);
                    this.width = ko.observable('');
                    this.hasEnumFilter = ko.observable(false);
                    this.formatAsAmount = false;
                    this.formatAsCurrency = false;
                    this.filterEnumOptions = ko.observableArray([]);
                    this.filterEnumSelectedValue = ko.observableArray([]);
                    this.filterBoolSelectedValue = ko.observable();
                    // filter date range (type Date)
                    this.filterDateRangeFrom = ko.observable();
                    this.filterDateRangeTo = ko.observable();
                    // displayed filter date according to culture info (type String)
                    this.filterDisplayFrom = ko.observable('');
                    this.filterDisplayTo = ko.observable('');
                    this.ddFilterFocus = ko.observable();
                    this.ddFocus = ko.observable();
                    this.boolOptions = ko.observableArray();
                    // helper observable for handling windows resize and re-setting position in filterDropDownLeft()
                    this.windowSize = ko.observable();
                    this.filterDropDownVisible = ko.pureComputed(function () {
                        var item = _.find(_this.filterEnumOptions(), function (ddItem) {
                            return ko.unwrap(ddItem[hasFocusPropName]) === true;
                        });
                        return (item != null || _this.ddFilterFocus() === true || _this.ddFocus() === true);
                    }).extend({ throttle: 200 });
                    this.filterDropDownHeight = ko.pureComputed(function () {
                        if (_this.filterDropDownVisible() === true && _.isNumber(ko.unwrap(_this.maxVisibleFilterOptions))) {
                            var ddElem = $("#" + _this.ddFilterUniqueId);
                            var itmHeight = ddElem.find('label > div').first().outerHeight();
                            var borderHeight = ddElem.outerHeight() - ddElem.innerHeight();
                            return ((ko.unwrap(_this.maxVisibleFilterOptions) * itmHeight) + borderHeight).toString() + 'px';
                        }
                        return null;
                    });
                    this.filterDropDownLeft = ko.pureComputed(function () {
                        if (_this.filterDropDownVisible() === true) {
                            // dummy read to force recalc when windowSize changed
                            _this.windowSize();
                            var posLeft = null;
                            var input = $("#" + _this.filterUniqueId);
                            var dd = $("#" + _this.ddFilterUniqueId);
                            var ddWidth = dd.outerWidth();
                            var inputPos = input.position().left;
                            var inputWidth = input.outerWidth();
                            var winWidth = $(window).innerWidth();
                            if (inputPos + ddWidth >= winWidth) {
                                posLeft = inputPos + inputWidth - ddWidth;
                            }
                            else {
                                posLeft = input.position().left;
                            }
                            return posLeft + "px";
                        }
                        return 0;
                    });
                    this.filterDropDownMinWidth = ko.pureComputed(function () {
                        if (_this.filterDropDownVisible() === true) {
                            // dummy read to force recalc when windowSize changed
                            _this.windowSize();
                            var minWidth = $("#" + _this.filterUniqueId).outerWidth();
                            return minWidth + "px";
                        }
                        return null;
                    });
                    this.ddOverflow = ko.observable();
                    this.subscriptions = [];
                    this.dataContext = dc;
                    if (column.DisplayColumnName && column.DisplayColumnName.length > 0) {
                        this.dispName = column.DisplayColumnName;
                    }
                    if (column.Name && column.Name.length > 0) {
                        this.name = column.Name;
                        this.dispName = this.dispName || this.name;
                    }
                    this.dataType = this.dispDataType = column.DataType && column.DataType.length > 0 ? column.DataType : 'string';
                    if (column.DisplayDataType && column.DisplayDataType.length > 0) {
                        this.dispDataType = column.DisplayDataType;
                    }
                    this.caption = column.Caption;
                    if (column.ColumnWidth && column.ColumnWidth.length > 0) {
                        this.width(column.ColumnWidth);
                    }
                    this.isCaptionLocalized = column.IsCaptionLocalized === true ? true : false;
                    this.isHtml = column.IsHtml;
                    if (column.formatAsAmount) {
                        this.formatAsAmount = column.formatAsAmount;
                    }
                    if (column.formatAsCurrency) {
                        this.formatAsCurrency = column.formatAsCurrency;
                    }
                    if (column.filterOptionSource) {
                        this.filterOptionSource = column.filterOptionSource;
                        this.filterEnumOptions(this.getFilterEnumOptionsFromSource());
                        this.hasEnumFilter(true);
                        this.subscriptions.push(this.filterOptionSource.items.subscribe(this.onFilterOptionSourceChanged, this));
                    }
                    else if (column.filterOptions && column.filterOptions.length > 0) {
                        _.each(column.filterOptions, function (item) {
                            _.assign(item, item[hasFocusPropName] = ko.observable());
                            _this.filterEnumOptions.push(item);
                        });
                        this.hasEnumFilter(true);
                    }
                    this.maxVisibleFilterOptions = maxVisibleFilterOptions;
                    this.filterEnabled = (this.dataType === 'string' || this.dataType === 'integer' || this.dataType === 'decimal' ||
                        this.dataType === 'bool' || this.dataType === 'date') && (column.EnableFilter !== false);
                    if (this.dataType === 'bool') {
                        this.createLocalizedBoolFilterOptions();
                        this.subscriptions.push(window.sf.localization.currentCultureCode.subscribe(function () {
                            _this.createLocalizedBoolFilterOptions();
                        }));
                    }
                    if (this.dataType === 'date') {
                        this.subscriptions.push(this.filterDateRangeFrom.subscribe(function (newVal) {
                            if (newVal != null) {
                                _this.filterDisplayFrom(_this.localization.currentCulture().dateToStr(newVal));
                            }
                            else {
                                _this.filterDisplayFrom('');
                            }
                        }));
                        this.subscriptions.push(this.filterDateRangeTo.subscribe(function (newVal) {
                            if (newVal != null) {
                                _this.filterDisplayTo(_this.localization.currentCulture().dateToStr(newVal));
                            }
                            else {
                                _this.filterDisplayTo('');
                            }
                        }));
                        this.subscriptions.push(this.filterDisplayFrom.subscribe(function (newVal) {
                            if (newVal === '') {
                                _this.filterDateRangeFrom(null);
                            }
                        }));
                        this.subscriptions.push(this.filterDisplayTo.subscribe(function (newVal) {
                            if (newVal === '') {
                                _this.filterDateRangeTo(null);
                            }
                        }));
                    }
                    if (this.hasEnumFilter() === true) {
                        var uniqueId = "" + Date.now() + Math.random().toString(16).substr(2, 5).toUpperCase();
                        this.filterUniqueId = this.dispName + "-" + uniqueId;
                        this.ddFilterUniqueId = this.dispName + "-dd-" + uniqueId;
                        this.filterEnumSelectedOptionText = ko.pureComputed(this.getfilterEnumSelectedOptionText, this);
                        this.ddOverflow(this.getFilterDdOverflow());
                    }
                }
                ListGridColumnModel.prototype.createLocalizedBoolFilterOptions = function () {
                    var culture = window.sf.localization.currentCulture();
                    this.boolOptions.removeAll();
                    this.boolOptions.push(new SelectOption(null, ''));
                    this.boolOptions.push(new SelectOption(true, culture.boolToStr(true)));
                    this.boolOptions.push(new SelectOption(false, culture.boolToStr(false)));
                };
                ListGridColumnModel.prototype.getfilterEnumSelectedOptionText = function () {
                    var _this = this;
                    var result = _.map(this.filterEnumSelectedValue(), function (filterVal) {
                        var itm = _.find(_this.filterEnumOptions(), function (filterOption) {
                            return filterOption.value === filterVal;
                        });
                        return itm ? itm.isLocalized === true ? _this.dataContext.$localize(itm.text) : ko.unwrap(itm.text) : filterVal;
                    });
                    return result;
                };
                ListGridColumnModel.prototype.getFilterEnumOptionsFromSource = function () {
                    var result = [];
                    var displayMemberName = this.filterOptionSource.getDisplayMemberName();
                    var valueMemberName = this.filterOptionSource.getValueMemberName();
                    var codelistItems = _.orderBy(this.filterOptionSource.items(), displayMemberName);
                    _.each(codelistItems, function (itm) {
                        var item;
                        if (itm[displayMemberName]) {
                            item = { value: itm[valueMemberName], text: itm[displayMemberName] };
                        }
                        else {
                            item = { value: itm[valueMemberName], text: itm[valueMemberName] };
                        }
                        _.assign(item, item[hasFocusPropName] = ko.observable());
                        result.push(item);
                    });
                    return result;
                };
                ListGridColumnModel.prototype.getFilterDdOverflow = function () {
                    var mfo = ko.unwrap(this.maxVisibleFilterOptions);
                    if (_.isNumber(mfo) && this.filterEnumOptions().length > mfo) {
                        // in FF default overflow in combination with max-height eats inner horizontal space and long items are wrapping
                        return '-moz-scrollbars-vertical';
                    }
                    return null;
                };
                ListGridColumnModel.prototype.onFilterOptionSourceChanged = function () {
                    this.filterEnumOptions.removeAll();
                    this.filterEnumOptions(this.getFilterEnumOptionsFromSource());
                    this.ddOverflow(this.getFilterDdOverflow());
                };
                ListGridColumnModel.prototype.clearFilterValue = function () {
                    this.isFilterActive(false);
                    if (this.hasEnumFilter() === true) {
                        this.filterEnumSelectedValue.removeAll();
                    }
                    else {
                        switch (this.dataType) {
                            case 'string':
                            case 'integer':
                            case 'decimal':
                                this.filterText('');
                                break;
                            case 'date':
                                this.filterDateRangeFrom(null);
                                this.filterDateRangeTo(null);
                                break;
                            case 'bool':
                                this.filterBoolSelectedValue(null);
                                break;
                        }
                    }
                };
                ListGridColumnModel.prototype.dispose = function () {
                    _.each(this.subscriptions, function (sub) {
                        sub.dispose();
                    });
                };
                return ListGridColumnModel;
            }());
            listGrid2.ListGridColumnModel = ListGridColumnModel;
        })(listGrid2 = components.listGrid2 || (components.listGrid2 = {}));
    })(components = sffw.components || (sffw.components = {}));
})(sffw || (sffw = {}));
var sffw;
(function (sffw) {
    var components;
    (function (components) {
        var listGrid2;
        (function (listGrid2) {
            'use strict';
            var ListGridDataRecord = /** @class */ (function () {
                function ListGridDataRecord($dataStruct, columns, rowSelectedPropName, rowMarkedPropName, checkboxInRowAttName) {
                    var _this = this;
                    this.$dataStruct = $dataStruct;
                    this.rowSelectedPropName = rowSelectedPropName;
                    this.rowMarkedPropName = rowMarkedPropName;
                    this.checkboxInRowAttName = checkboxInRowAttName;
                    this.$rowCss = ko.pureComputed(function () {
                        var classes = [];
                        // marked rows should not apply any additional styles (selected, odd-even, hover...)
                        if (_this.$marked()) {
                            classes.push('sffw-listgrid-marked-row');
                        }
                        else {
                            if (_this.$selected()) {
                                classes.push('sffw-listgrid-selected-row');
                            }
                            if (_this.$colorIndicator()) {
                                classes.push('sffw-listgrid-colorindicator-' + _this.$colorIndicator().toLowerCase());
                            }
                        }
                        return classes.join(' ');
                    });
                    if (typeof ($dataStruct[this.rowSelectedPropName]) !== 'undefined') {
                        this.$selected = $dataStruct[this.rowSelectedPropName].$value;
                    }
                    else {
                        this.$selected = ko.observable(false);
                    }
                    if (typeof ($dataStruct[this.rowMarkedPropName]) !== 'undefined') {
                        this.$marked = $dataStruct[this.rowMarkedPropName].$value;
                    }
                    else {
                        this.$marked = ko.observable(false);
                    }
                    if (typeof ($dataStruct[this.checkboxInRowAttName]) !== 'undefined') {
                        this.$checkbox = $dataStruct[this.checkboxInRowAttName].$hasValue() ? $dataStruct[this.checkboxInRowAttName].$value : ko.observable(false);
                    }
                    else {
                        this.$checkbox = ko.observable();
                    }
                    this.$colorIndicator = ko.observable();
                    var culture = window.sf.localization.currentCulture();
                    _.forEach(columns, function (column) {
                        var attValue = $dataStruct[column.dispName];
                        switch (column.dispDataType) {
                            case 'string':
                            case 'integer':
                                if (attValue === null || _.isUndefined(attValue) || (typeof (attValue.$hasValue) === 'function' && attValue.$hasValue() === false)) {
                                    _this[column.dispName] = '';
                                }
                                else if (column.formatAsAmount || column.formatAsCurrency) {
                                    _this[column.dispName] = sffw.formatAsAmountOrCurrency(typeof (attValue.$asString) === 'function' ? attValue.$asString() : attValue, column.formatAsAmount, column.formatAsCurrency);
                                }
                                else {
                                    _this[column.dispName] = typeof (attValue.$asString) === 'function' ? attValue.$asString() : attValue;
                                }
                                break;
                            case 'decimal':
                                if (attValue === null || _.isUndefined(attValue) || (typeof (attValue.$hasValue) === 'function' && attValue.$hasValue() === false)) {
                                    _this[column.dispName] = '';
                                }
                                else if (column.formatAsAmount || column.formatAsCurrency) {
                                    _this[column.dispName] = sffw.formatAsAmountOrCurrency(typeof (attValue.$asString) === 'function' ? attValue.$asString() : culture.decimalToStr(attValue), column.formatAsAmount, column.formatAsCurrency);
                                }
                                else {
                                    _this[column.dispName] = typeof (attValue.$asString) === 'function' ? attValue.$asString() : culture.decimalToStr(attValue);
                                }
                                break;
                            case 'date':
                                if (attValue === null || _.isUndefined(attValue) || (typeof (attValue.$hasValue) === 'function' && attValue.$hasValue() === false)) {
                                    _this[column.dispName] = '';
                                }
                                else {
                                    _this[column.dispName] = typeof (attValue.$asString) === 'function' ? attValue.$asString() : culture.dateToStr(moment(attValue).toDate());
                                }
                                break;
                            case 'bool':
                                if (attValue === null || _.isUndefined(attValue) || (typeof (attValue.$hasValue) === 'function' && attValue.$hasValue() === false)) {
                                    _this[column.dispName] = '';
                                }
                                else {
                                    _this[column.dispName] = typeof (attValue.$asString) === 'function' ? attValue.$asString() : culture.boolToStr(attValue);
                                }
                                break;
                            default:
                                throw new Error("Unknown column type " + column.dataType + " in ListGridDataRecord constructor");
                        }
                        if (column.dispName === 'ColorIndicator' && attValue) {
                            _this.$colorIndicator(attValue);
                        }
                    });
                }
                return ListGridDataRecord;
            }());
            listGrid2.ListGridDataRecord = ListGridDataRecord;
        })(listGrid2 = components.listGrid2 || (components.listGrid2 = {}));
    })(components = sffw.components || (sffw.components = {}));
})(sffw || (sffw = {}));
var sffw;
(function (sffw) {
    var components;
    (function (components) {
        var listGrid2;
        (function (listGrid2) {
            var ListGridViewModel = /** @class */ (function () {
                function ListGridViewModel(params, componentInfo) {
                    var _this = this;
                    this.columns = [];
                    this.visibleColumns = ko.observableArray();
                    this.hiddenColumns = ko.observableArray();
                    this.records = ko.observableArray();
                    this.pageBackEnabled = ko.pureComputed(function () {
                        return _this.pageNumber() > 1;
                    });
                    this.pageForwardEnabled = ko.pureComputed(function () {
                        return _this.pageNumber() < _this.pagesCount();
                    });
                    this.orderByColumnName = ko.pureComputed(function () {
                        return _this.ctrlCore.getSortingColumn();
                    }, this);
                    this.isDescending = ko.pureComputed(function () {
                        return _this.ctrlCore.getSortingOrder() && _this.ctrlCore.getSortingOrder() === 'desc';
                    }, this);
                    this.checkboxColumnVisible = ko.observable(false);
                    this.actionButtons = [];
                    this.pageSizeValues = ko.observableArray([5, 10, 20, 30]);
                    this.allRowsChecked = ko.pureComputed(function () {
                        return _.every(_this.getRecordsWithCheckbox(), function (row) {
                            sffw.assert(_.isFunction(row.$selected));
                            return row.$selected();
                        });
                    }, this);
                    this.subscriptions = [];
                    this.isViewSettingsComponentAvailable = ko.observable(false);
                    this.onMultipleDropdownChange = function (col, newValue) {
                        if (_.isArray(newValue)) {
                            _this.ctrlCore.setTextFilter(col.name, col.filterEnumSelectedValue().join(','));
                            col.isFilterActive(_this.ctrlCore.isFilterActive(col.name));
                        }
                    };
                    this.onFilterDropdownChange = function (col, newValue) {
                        var boolVal = null;
                        if (col.dataType === 'bool' && (newValue === true || newValue === false)) {
                            boolVal = newValue;
                        }
                        if (boolVal != null) {
                            _this.ctrlCore.setBooleanFilter(col.name, boolVal);
                        }
                        else {
                            _this.ctrlCore.setBooleanFilter(col.name, null);
                        }
                        col.isFilterActive(_this.ctrlCore.isFilterActive(col.name));
                    };
                    this.onFilterDateFromChange = function (col, newValue) {
                        _this.ctrlCore.setDateRangeFilterStart(col.name, col.filterDateRangeFrom());
                        col.isFilterActive(_this.ctrlCore.isFilterActive(col.name));
                    };
                    this.onFilterDateToChange = function (col, newValue) {
                        _this.ctrlCore.setDateRangeFilterEnd(col.name, col.filterDateRangeTo());
                        col.isFilterActive(_this.ctrlCore.isFilterActive(col.name));
                    };
                    this.onFilterChanged = function (col, newValue) {
                        // if value is not trimmed, we do it first, which will trigger another event later
                        var trimmed = newValue.trim();
                        if (trimmed !== newValue) {
                            return;
                        }
                        _this.ctrlCore.setTextFilter(col.name, col.filterText());
                        col.isFilterActive(_this.ctrlCore.isFilterActive(col.name));
                    };
                    this.onPageMinClick = function () {
                        _this.page('1');
                    };
                    this.onPageMaxClick = function () {
                        var newPageNum = _this.pagesCount();
                        _this.page(newPageNum.toString());
                    };
                    this.onPageForwardClick = function () {
                        if (_this.pageNumber() < _this.pagesCount()) {
                            var newPageNum = _this.pageNumber() + 1;
                            _this.page(newPageNum.toString());
                        }
                    };
                    this.onPageBackClick = function () {
                        if (_this.pageNumber() > 1) {
                            var newPageNum = _this.pageNumber() - 1;
                            _this.page(newPageNum.toString());
                        }
                    };
                    this.onPageRefreshClick = function () {
                        _this.clearSelection();
                        _this.ctrlCore.loadData();
                    };
                    this.onColumnHeaderClick = function (column) {
                        _this.ctrlCore.changeSortColumnOrDirection(column.name);
                        _this.clearSelection();
                    };
                    this.onViewSettingsClick = function () {
                        var promiseChain = Promise.resolve();
                        promiseChain = promiseChain.then(function () {
                            _this.ctrlCore.setViewSettingsComponentEnabled(!_this.ctrlCore.isViewSettingsComponentEnabled());
                        });
                        if (_this.onViewSettingsClickHandler) {
                            promiseChain = promiseChain.then(function () {
                                return _this.onViewSettingsClickHandler();
                            });
                        }
                        return promiseChain;
                    };
                    this.onClearFiltersClick = function () {
                        _this.ctrlCore.clearVisibleFilters();
                        _this.clearViewModelVisibleFilters();
                    };
                    this.dataContext = params.$parentData;
                    this.listName = params.listName;
                    this.selectionChangeHandler = params.onSelectionChange;
                    this.ctrlCore = params.controller.ctrlCore;
                    this.urlRouter = params.urlRouter;
                    this.targetFormAliasAttName = params.targetFormAliasAttName;
                    this.targetForms = params.targetForms;
                    this.accessibleName = params.accessibleName;
                    this.actionButtonsColumnCaption = params.actionButtonsColumnCaption;
                    this.maxVisibleFilterOptions = params.maxVisibleFilterOptions;
                    if (typeof params.showCheckboxes !== 'undefined') {
                        if (_.isFunction(params.showCheckboxes)) {
                            this.checkboxColumnVisible = params.showCheckboxes;
                        }
                        else {
                            this.checkboxColumnVisible(params.showCheckboxes);
                        }
                    }
                    else {
                        this.checkboxColumnVisible(false);
                    }
                    this.onButtonClickedHandler = params.onButtonClicked;
                    this.onViewSettingsClickHandler = params.onViewSettingsButtonClicked;
                    this.onRowsChangedHandler = params.onRowsChanged;
                    this.onRowClickHandler = params.onRowClicked;
                    this.isMultiselect = params.isMultiselect;
                    this.allowSelectAll = params.allowSelectAll;
                    this.rowSelectedPropName = params.isRowSelectedAttName || '_selected';
                    this.rowMarkedPropName = params.isRowMarkedAttName || '_marked';
                    this.checkboxInRowAttName = params.showCheckboxInRowAttName || '_checkbox';
                    this.lastClickedRowSelectWhenCheckboxesOff = params.lastClickedRowSelectWhenCheckboxesOff;
                    this.pagingControlsPosition = params.pagingControlsPosition || 'bottom';
                    this.actionButtonsColumnWidth = params.actionButtonsColumnWidth;
                    this.clickedActionButtonName = params.lastActionButtonClickedName;
                    this.actionButtons = params.actionButtons;
                    this.pagingTemplate = [];
                    if (params.pagingTemplate != null && params.pagingTemplate !== '') {
                        this.pagingTemplate = params.pagingTemplate.split('|');
                    }
                    this.dataCollection = params.dataCollection;
                    this.selectedRowReference = params.lastClickedRow;
                    this.savedState = params.savedState;
                    this.savedStateOptions = params.savedStateOptions;
                    this.savedColumns = params.savedColumns;
                    this.allowFilterClearIcon = params.allowFilterClearIcon;
                    this.createColumns(params.columns);
                    var wasCtrlReady = this.ctrlCore.isReady();
                    if (wasCtrlReady === true) {
                        this.ctrlCore.isReady(false);
                    }
                    this.ctrlCore.initColumns(params.columns);
                    if (this.savedColumns) {
                        var cols = ko.unwrap(this.savedColumns);
                        if (cols && cols.length > 0) {
                            this.ctrlCore.setVisibleColumns(JSON.parse(cols));
                            this.setColumnsVisibilityAndOrder();
                        }
                    }
                    this.pageNumber = this.ctrlCore.activePage;
                    this.page = ko.observable(_.isNumber(this.pageNumber()) ? this.pageNumber().toString() : '');
                    this.error = this.ctrlCore.error;
                    this.isLoading = this.ctrlCore.isLoading;
                    this.ctrlCore.listName = params.listName;
                    this.recordsCount = this.ctrlCore.rowCount;
                    this.pageSize = this.ctrlCore.pageSize;
                    this.isViewSettingsComponentAvailable(this.ctrlCore.isViewSettingsComponentAvailable());
                    this.subscriptions.push(this.ctrlCore.isViewSettingsComponentAvailable.subscribe(function (isViewSettingsComponentAvailable) {
                        _this.isViewSettingsComponentAvailable(isViewSettingsComponentAvailable);
                    }));
                    // there is always at least 1 page even if there is no record
                    this.pagesCount = ko.pureComputed(function () { return Math.ceil(_this.recordsCount() / _this.ctrlCore.pageSize()) || 1; });
                    this.subscriptions.push(this.pageNumber.subscribe(function (newPageNum) {
                        _this.page(newPageNum.toString());
                    }));
                    this.subscriptions.push(this.page.subscribe(function (newPageStr) {
                        var n = Number(_this.page().trim());
                        if (_.isNaN(n) || n < 1 || n > _this.pagesCount() || !_.isInteger(n)) {
                            _this.page(_this.pageNumber().toString());
                        }
                        else {
                            if (_this.pageNumber() !== n) {
                                _this.pageNumber(n);
                            }
                        }
                    }));
                    this.subscriptions.push(this.ctrlCore.isReady.subscribe(function (isReady) {
                        if (isReady) {
                            _this.setColumnFilters();
                            _this.setColumnsVisibilityAndOrder();
                        }
                    }));
                    if (this.savedState) {
                        var state = ko.unwrap(this.savedState);
                        if (state && state.length > 0) {
                            this.ctrlCore.loadState(state);
                        }
                    }
                    this.setColumnFilters();
                    this.subscriptions.push(this.ctrlCore.rows.subscribe(this.onRowsChange, this, 'arrayChange'));
                    this.ctrlCore.onClearState = function () {
                        _this.clearViewModelVisibleFilters();
                    };
                    if (wasCtrlReady === true) {
                        this.ctrlCore.isReady(true);
                    }
                }
                ListGridViewModel.prototype.getRecordsWithCheckbox = function () {
                    var _this = this;
                    return _.filter(this.records(), function (r) {
                        return _this.isCheckboxOnRow(r);
                    });
                };
                ListGridViewModel.prototype.clearViewModelVisibleFilters = function () {
                    _.each(this.columns, function (col) {
                        col.clearFilterValue();
                    });
                };
                ListGridViewModel.prototype.onRowsChange = function () {
                    var _this = this;
                    this.records.removeAll();
                    this.clearSelection();
                    var newDataRecords = [];
                    var promiseChain = this.dataCollection.$fromJson(this.ctrlCore.rows()).then(function () {
                        newDataRecords = _.map(_this.dataCollection.$items(), function (obj) {
                            return new listGrid2.ListGridDataRecord(obj, _this.columns, _this.rowSelectedPropName, _this.rowMarkedPropName, _this.checkboxInRowAttName);
                        });
                        _.each(newDataRecords, function (r) {
                            _this.records.push(r);
                        });
                        if (_this.savedState) {
                            var opts = _this.savedStateOptions || null;
                            _this.savedState(_this.ctrlCore.saveState(opts));
                        }
                        return _this.setFocusedRow(_this.ctrlCore.focusedRecordIndex());
                    });
                    if (this.onRowsChangedHandler) {
                        promiseChain = promiseChain.then(function () {
                            return _this.onRowsChangedHandler();
                        });
                    }
                    return promiseChain;
                };
                ListGridViewModel.prototype.setFocusedRow = function (index) {
                    if (index >= 0 && index < this.records().length) {
                        var focusedRecord = this.records()[index];
                        var onRc = this.onRowClick(focusedRecord, null, null);
                        if (onRc !== true) {
                            return onRc;
                        }
                    }
                };
                ListGridViewModel.prototype.selectionChange = function (row) {
                    var _this = this;
                    sffw.assert(!!row);
                    sffw.assert(_.isFunction(row.$selected));
                    var promiseChain = Promise.resolve();
                    if (this.selectedRow === row) {
                        // click on selected row does nothing
                        return promiseChain;
                    }
                    if (this.selectedRow) {
                        this.selectedRow.$selected(false);
                    }
                    this.selectedRow = row;
                    if (this.lastClickedRowSelectWhenCheckboxesOff && !this.checkboxColumnVisible()) {
                        row.$selected(true);
                    }
                    // nastaveni posledniho oznaceneho radku
                    if (this.selectedRowReference && row.$dataStruct) {
                        promiseChain = promiseChain.then(function () {
                            return _this.selectedRowReference.$emptyRecursive();
                        })
                            .then(function () {
                            return _this.selectedRowReference.$fromJson(row.$dataStruct.$createJsonObj());
                        });
                    }
                    if (this.selectionChangeHandler) {
                        promiseChain = promiseChain.then(function () {
                            return _this.selectionChangeHandler();
                        });
                    }
                    return promiseChain;
                };
                ListGridViewModel.prototype.createColumns = function (columns) {
                    var _this = this;
                    _(columns).each(function (c, index) {
                        var column = new listGrid2.ListGridColumnModel(c, _this.dataContext, _this.maxVisibleFilterOptions, index);
                        _this.columns.push(column);
                        if (c.IsVisible !== false) { // may be undefined because of default value
                            _this.visibleColumns.push(column);
                        }
                        else {
                            _this.hiddenColumns.push(column);
                        }
                        if (c.DataType === 'bool') {
                            _this.subscriptions.push(column.filterBoolSelectedValue.subscribe(_.partial(_this.onFilterDropdownChange, column)));
                        }
                        else if (c.DataType === 'date') {
                            _this.subscriptions.push(column.filterDateRangeFrom.subscribe(_.partial(_this.onFilterDateFromChange, column)));
                            _this.subscriptions.push(column.filterDateRangeTo.subscribe(_.partial(_this.onFilterDateToChange, column)));
                        }
                        else if (column.hasEnumFilter() === true) {
                            _this.subscriptions.push(column.filterEnumSelectedValue.subscribe(_.partial(_this.onMultipleDropdownChange, column)));
                        }
                        else {
                            _this.subscriptions.push(column.filterText.subscribe(_.partial(_this.onFilterChanged, column)));
                        }
                    });
                    this.isAnyFilterEnabled = _.some(this.columns, function (c) {
                        return c.filterEnabled === true;
                    });
                };
                ListGridViewModel.prototype.setColumnFilters = function () {
                    var _this = this;
                    _.each(this.columns, function (col) {
                        col.isFilterActive(false);
                    });
                    if (this.ctrlCore.columnFilters().length > 0) {
                        _.each(this.ctrlCore.columnFilters(), function (colFilter) {
                            var filteredColumn = _.find(_this.columns, function (col) { return col.name === colFilter.name; });
                            if (filteredColumn) {
                                if (colFilter.type === 'text') {
                                    if (filteredColumn.hasEnumFilter() === true) {
                                        if (colFilter.getValue().length > 0) {
                                            filteredColumn.filterEnumSelectedValue(colFilter.getValue().split(','));
                                            filteredColumn.isFilterActive(colFilter.hasValue());
                                        }
                                    }
                                    else {
                                        switch (filteredColumn.dataType) {
                                            case 'string':
                                            case 'integer':
                                            case 'decimal':
                                                filteredColumn.filterText(colFilter.getValue());
                                                filteredColumn.isFilterActive(colFilter.hasValue());
                                                break;
                                        }
                                    }
                                }
                                if (colFilter.type === 'boolean') {
                                    switch (filteredColumn.dataType) {
                                        case 'bool':
                                            var culture = window.sf.localization.currentCulture();
                                            filteredColumn.filterBoolSelectedValue(colFilter.getValue());
                                            filteredColumn.isFilterActive(colFilter.hasValue());
                                            break;
                                    }
                                }
                                if (colFilter.type === 'date') {
                                    switch (filteredColumn.dataType) {
                                        case 'date':
                                            filteredColumn.filterDateRangeFrom(colFilter.getStart());
                                            filteredColumn.filterDateRangeTo(colFilter.getEnd());
                                            filteredColumn.isFilterActive(colFilter.hasValue());
                                            break;
                                    }
                                }
                            }
                        });
                    }
                };
                ListGridViewModel.prototype.clearSelection = function () {
                    var _this = this;
                    var promiseChain = Promise.resolve();
                    if (this.selectedRow) {
                        this.selectedRow.$selected(null);
                        this.selectedRow = null;
                    }
                    if (this.selectedRowReference) {
                        promiseChain = promiseChain.then(function () {
                            return _this.selectedRowReference.$emptyRecursive();
                        });
                    }
                    if (this.selectionChangeHandler) {
                        promiseChain = promiseChain.then(function () {
                            return _this.selectionChangeHandler();
                        });
                    }
                    return promiseChain;
                };
                ListGridViewModel.prototype.onRowClick = function (row, column, event) {
                    var _this = this;
                    if (event && event.ctrlKey) {
                        return true;
                    }
                    if (event) {
                        event.preventDefault();
                    }
                    return this.selectionChange(row).then(function () {
                        if (_this.onRowClickHandler) {
                            _this.onRowClickHandler(_this, event, { columnName: column ? column.dispName : null });
                        }
                    });
                };
                ListGridViewModel.prototype.ActionButtonClicked = function (button, row) {
                    var _this = this;
                    var promiseChain = Promise.resolve();
                    if (this.clickedActionButtonName && button.ButtonName != null && button.ButtonName !== '') {
                        promiseChain = promiseChain.then(function () {
                            return _this.clickedActionButtonName(button.ButtonName);
                        });
                    }
                    promiseChain = promiseChain.then(function () {
                        return _this.selectionChange(row);
                    });
                    if (this.onButtonClickedHandler) {
                        promiseChain = promiseChain.then(function () {
                            return _this.onButtonClickedHandler();
                        });
                    }
                    return promiseChain;
                };
                ListGridViewModel.prototype.CheckboxSelect = function (row, index) {
                    var _this = this;
                    sffw.assert(!!row);
                    sffw.assert(_.isFunction(row.$selected));
                    var promiseChain = Promise.resolve();
                    // nastaveni posledniho oznaceneho radku
                    if (this.selectedRowReference && row.$dataStruct) {
                        promiseChain = promiseChain.then(function () {
                            return _this.selectedRowReference.$emptyRecursive();
                        })
                            .then(function () {
                            var jsonObj = typeof (row.$dataStruct.$createJsonObj) === 'function' ? row.$dataStruct.$createJsonObj() : row.$dataStruct;
                            return _this.selectedRowReference.$fromJson(jsonObj);
                        });
                    }
                    promiseChain = promiseChain.then(function () {
                        var selected = row.$selected();
                        var att = null;
                        if (!_this.isMultiselect) {
                            _.each(_this.records(), function (r) {
                                r.$selected(false);
                            });
                            // nastaveni promene v kolekci
                            _.each(_this.dataCollection.$items(), function (item) {
                                att = item[_this.rowSelectedPropName];
                                if (att) {
                                    att.$value(false);
                                }
                            });
                            _this.records()[index()].$selected(selected);
                        }
                        att = _this.dataCollection.$items()[index()][_this.rowSelectedPropName];
                        if (att) {
                            att.$value(selected);
                        }
                    });
                    return true;
                };
                ListGridViewModel.prototype.checkAllRows = function () {
                    var _this = this;
                    if (this.isMultiselect) {
                        var isChecked_1 = this.allRowsChecked();
                        _.each(this.getRecordsWithCheckbox(), function (r) {
                            sffw.assert(_.isFunction(r.$selected));
                            r.$selected(!isChecked_1);
                        });
                        // nastaveni promene v kolekci
                        var itemsWithCheckbox = _.filter(this.dataCollection.$items(), function (item) {
                            var att = item[_this.checkboxInRowAttName];
                            if (att) {
                                return ko.unwrap(att.$value()) === true;
                            }
                            else {
                                return true;
                            }
                        });
                        _.each(itemsWithCheckbox, function (item) {
                            var att = item[_this.rowSelectedPropName];
                            if (att) {
                                att.$value(!isChecked_1);
                            }
                        });
                    }
                    return true;
                };
                ListGridViewModel.prototype.getRowHrefLink = function (record, rowIndex) {
                    if (this.urlRouter && this.targetFormAliasAttName) {
                        var targetFormAlias = null;
                        if (this.dataCollection && rowIndex >= 0) {
                            targetFormAlias = this.dataCollection.$items()[rowIndex][this.targetFormAliasAttName].$value();
                        }
                        if (this.targetForms && this.targetForms.length > 0 && targetFormAlias && targetFormAlias.length > 0) {
                            var targetForm = _.find(this.targetForms, { alias: targetFormAlias });
                            if (targetForm) {
                                var urlModel_1 = this.urlRouter.findFormUrl({ fullname: targetForm.routeFormName });
                                if (urlModel_1) {
                                    _.each(targetForm.routeParams, function (routeParam) {
                                        urlModel_1.addString({ name: routeParam.routeParamName, value: record[routeParam.routeParamValueColumnName] });
                                    });
                                    return urlModel_1.getPageUrl();
                                }
                            }
                        }
                    }
                    return null;
                };
                ListGridViewModel.prototype.getRowHrefAria = function (record, rowIndex) {
                    if (this.urlRouter && this.targetFormAliasAttName) {
                        var targetFormAlias = null;
                        if (this.dataCollection && rowIndex >= 0) {
                            targetFormAlias = this.dataCollection.$items()[rowIndex][this.targetFormAliasAttName].$value();
                        }
                        if (this.targetForms && this.targetForms.length > 0 && targetFormAlias && targetFormAlias.length > 0) {
                            var targetForm = _.find(this.targetForms, { alias: targetFormAlias });
                            if (targetForm) {
                                var result_1 = targetFormAlias;
                                var urlModel = this.urlRouter.findFormUrl({ fullname: targetForm.routeFormName });
                                if (urlModel) {
                                    _.each(targetForm.routeParams, function (routeParam) {
                                        result_1 = result_1.concat("," + routeParam.routeParamName + "=" + record[routeParam.routeParamValueColumnName]);
                                    });
                                    return result_1;
                                }
                            }
                        }
                    }
                    return null;
                };
                ListGridViewModel.prototype.isCheckboxOnRow = function (record) {
                    return ko.unwrap(this.checkboxColumnVisible) && (ko.unwrap(record.$checkbox) !== false);
                };
                // List controller holds current column visibility and order
                // that can be different than at design-time
                ListGridViewModel.prototype.setColumnsVisibilityAndOrder = function () {
                    var _this = this;
                    var orderedCols = this.ctrlCore.getVisibleColumns();
                    if (orderedCols) {
                        var tmpVisibleCols_1 = [];
                        _.each(orderedCols, function (cName) {
                            var cModel = _.find(_this.columns, function (col) {
                                return col.name === cName;
                            });
                            if (cModel) {
                                tmpVisibleCols_1.push(cModel);
                            }
                        });
                        this.visibleColumns(tmpVisibleCols_1);
                        var tmpHiddenCols = _.filter(this.columns, function (col) {
                            var vc = _.find(_this.visibleColumns(), function (visCol) {
                                return col.name === visCol.name;
                            });
                            return vc === undefined;
                        });
                        this.hiddenColumns(tmpHiddenCols);
                    }
                    if (this.savedColumns) {
                        this.savedColumns(JSON.stringify(orderedCols));
                    }
                };
                ListGridViewModel.prototype.dispose = function () {
                    _.each(this.subscriptions, function (sub) {
                        sub.dispose();
                    });
                    _(this.columns).each(function (column) {
                        column.dispose();
                    });
                };
                return ListGridViewModel;
            }());
            listGrid2.ListGridViewModel = ListGridViewModel;
        })(listGrid2 = components.listGrid2 || (components.listGrid2 = {}));
    })(components = sffw.components || (sffw.components = {}));
})(sffw || (sffw = {}));
var sffw;
(function (sffw) {
    var components;
    (function (components) {
        var listGrid2;
        (function (listGrid2) {
            if (ko && !ko.components.isRegistered('sffw-listgrid2')) {
                ko.components.register('sffw-listgrid2', {
                    viewModel: {
                        createViewModel: function (params, componentInfo) { return new sffw.components.listGrid2.ListGridViewModel(params, componentInfo); }
                    },
                    synchronous: true,
                    template: "\n<div class=\"sffw-listgrid\">\n    <!-- ko if: pagingControlsPosition === 'top' || pagingControlsPosition === 'both' -->\n    <div class=\"sffw-listgrid-paging-top\">\n        <!-- ko foreach: pagingTemplate -->\n            <span data-bind=\"template: { name: $data }\"></span>\n        <!-- /ko -->\n    </div>\n    <!-- /ko -->\n\n    <table role=\"table\" data-bind=\"attr: { 'aria-rowcount': recordsCount, 'aria-label': accessibleName }\">\n        <thead>\n            <!-- captions -->\n            <tr>\n            <!-- ko if: checkboxColumnVisible -->\n                <!-- ko if: isMultiselect && allowSelectAll  -->\n                    <th style=\"width: 2%; text-align: center;\"><span>\n                        <input tabindex=\"0\" type=\"checkbox\" data-bind=\"checked: allRowsChecked, click: function(data, event){ return checkAllRows(); }, clickBubble: false, attr: { 'aria-label': $root.$localize('ListGrid2$$selectAll') }\"></input>\n                    </span></th>\n                <!-- /ko -->\n                <!-- ko ifnot: isMultiselect && allowSelectAll  -->\n                    <th style=\"width: 2%;\"></th>\n                <!-- /ko -->\n            <!-- /ko -->\n            <!-- ko foreach: visibleColumns -->\n                <th data-bind=\"style: { width: $data.width }, css: { 'enum-th' : dataType == 'date' }, winsize: windowSize\" class=\"noselect\">\n                    <div data-bind=\"click: $parent.onColumnHeaderClick\">\n                        <span role=\"button\" data-bind=\"text: (isCaptionLocalized == true ?  $root.$localize(caption) :  caption),\n                            css: {'sffw-listgrid-sort-active': ($parent.orderByColumnName() === name)}\">\n                        </span>\n                        <div class=\"sffw-listgrid-display-inline sffw-listgrid-ordering-glyph\">\n                            <span data-bind=\"visible: ($parent.orderByColumnName() === name) && !$parent.isDescending()\"><i class=\"fa fa-sort-alpha-asc\"></i></span>\n                            <span data-bind=\"visible: ($parent.orderByColumnName() === name) && $parent.isDescending()\"><i class=\"fa fa-sort-alpha-desc\"></i></span>\n                        </div>\n                    </div>\n                    <!-- ko if: $parent.isAnyFilterEnabled -->\n                    <div>\n                        <div data-bind=\"visible: $parent.allowFilterClearIcon\" class=\"sffw-listgrid-display-inline sffw-listgrid-clear-glyph\">\n                            <button data-bind=\"visible: isFilterActive, click: clearFilterValue, clickBubble: false\"><i class=\"fa fa-remove\"></i></button>\n                        </div>\n                        <!-- ko if: dataType == 'bool' -->\n                            <div data-bind=\"css: {'sffw-listgrid-filter-wrap': $parent.allowFilterClearIcon}\"><select data-bind=\"options: boolOptions,\n                                    value: filterBoolSelectedValue,\n                                    optionsText: 'text',\n                                    optionsValue: 'value',\n                                    css: {'sffw-listgrid-filter-active': isFilterActive},\n                                    enable: filterEnabled,\n                                    style: { visibility: filterEnabled ? '' : 'hidden' },\n                                    attr: {'aria-label': (isCaptionLocalized == true ?  $root.$localize(caption) :  ko.unwrap(caption)) + ' ' + $root.$localize('ListGrid2$$filterValue')}\" class=\"sffw-listgrid-filter\"/>\n                            </div>\n                        <!-- /ko -->\n                        <!-- ko if: dataType == 'date' -->\n                            <div data-bind=\"css: {'sffw-listgrid-filter-wrap': $parent.allowFilterClearIcon}\"><input type=\"text\" autocomplete=\"off\" style=\"width: 46%; display: inline-block; float: left;\" class=\"sffw-listgrid-filter\" data-bind=\"filterDatePicker: filterDateRangeFrom,\n                                value: filterDisplayFrom,\n                                css: {'sffw-listgrid-filter-active': isFilterActive},\n                                enable: filterEnabled,\n                                style: { visibility: filterEnabled ? '' : 'hidden' },\n                                attr: { placeholder: $root.$localize('ListGrid2$$fromPlaceholderLocalization'),\n                                    'aria-label': (isCaptionLocalized == true ?  $root.$localize(caption) :  ko.unwrap(caption)) + ' (' + $root.$localize('ListGrid2$$fromPlaceholderLocalization') + ') ' + $root.$localize('ListGrid2$$filterValue') }\"/>\n                            <span data-bind=\"style: { visibility: filterEnabled ? '' : 'hidden' }\" style=\"display: inline-block; font-weight: bold; width: 8%; text-align: center;\">-</span>\n                            <input type=\"text\" autocomplete=\"off\" style=\"width: 46%; display: inline-block; float: right;\" class=\"sffw-listgrid-filter\" data-bind=\"filterDatePicker: filterDateRangeTo,\n                                value: filterDisplayTo,\n                                css: {'sffw-listgrid-filter-active': isFilterActive},\n                                enable: filterEnabled,\n                                style: { visibility: filterEnabled ? '' : 'hidden'},\n                                attr: { placeholder: $root.$localize('ListGrid2$$toPlaceholderLocalization'),\n                                    'aria-label': (isCaptionLocalized == true ?  $root.$localize(caption) :  ko.unwrap(caption)) + ' (' + $root.$localize('ListGrid2$$toPlaceholderLocalization') + ') ' + $root.$localize('ListGrid2$$filterValue') }\"/>\n                            </div>\n                        <!-- /ko -->\n                        <!-- ko if: hasEnumFilter() === true -->\n                            <div data-bind=\"css: {'sffw-listgrid-filter-wrap': $parent.allowFilterClearIcon}\"><input type=\"text\" autocomplete=\"off\" data-bind=\"hasFocus: ddFilterFocus, attr:{ id: filterUniqueId, 'aria-label': (isCaptionLocalized == true ?  $root.$localize(caption) :  ko.unwrap(caption)) + ' ' + $root.$localize('ListGrid2$$filterValue')},\n                                value: filterEnumSelectedOptionText,\n                                css: { 'sffw-listgrid-filter-active' : isFilterActive, 'sffw-listgrid-dd-filter-empty' : !isFilterActive() },\n                                enable: filterEnabled,\n                                style: { visibility: filterEnabled ? '' : 'hidden' },\"\n                                tabindex=\"0\" class=\"sffw-listgrid-filter sffw-listgrid-dd-filter\" readonly />\n                            </div>\n                            <div data-bind=\"hasFocus: ddFocus, visible: filterDropDownVisible, style: { left: filterDropDownLeft, 'max-height': filterDropDownHeight, 'min-width': filterDropDownMinWidth, overflow: ddOverflow }, attr: { id: ddFilterUniqueId }\" class=\"sffw-listgrid-dd\">\n                            <!-- ko foreach: filterEnumOptions -->\n                                <label data-bind=\"filterOptionHasFocus: $data.hasFocus\">\n                                    <div style=\"display: block; width: 100%; padding: 5px;\">\n                                        <input data-bind=\"checked: $parent.filterEnumSelectedValue,\n                                            attr: { value: $data.value, 'aria-label': ($data.isLocalized === true ? $root.$localize($data.text) : $data.text) }\"\n                                            type=\"checkbox\" class=\"dd-check-input\" tabindex=\"0\" />\n                                        <span data-bind=\"text: ($data.isLocalized === true ? $root.$localize($data.text) : $data.text)\" style=\"margin-left: 10px; display: inline-block;\"></span>\n                                    </div>\n                                </label>\n                            <!-- /ko -->\n                            </div>\n                        <!-- /ko -->\n                        <!-- ko ifnot: hasEnumFilter() === true -->\n                            <!-- ko if: dataType != 'bool' && dataType != 'date' && dataType != 'datetime' -->\n                                <div data-bind=\"css: {'sffw-listgrid-filter-wrap': $parent.allowFilterClearIcon}\"><input type=\"text\" autocomplete=\"off\" class=\"sffw-listgrid-filter\" data-bind=\"textInput: filterText,\n                                    css: {'sffw-listgrid-filter-active': isFilterActive},\n                                    enable: filterEnabled,\n                                    style: { visibility: filterEnabled ? '' : 'hidden' },\n                                    attr: {'aria-label': (isCaptionLocalized == true ?  $root.$localize(caption) :  ko.unwrap(caption)) + ' ' + $root.$localize('ListGrid2$$filterValue')}\" />\n                                </div>\n                            <!-- /ko -->\n                        <!-- /ko -->\n                        </div>\n                    <!-- /ko -->\n                </th>\n            <!-- /ko -->\n            <!-- action buttons -->\n            <!-- ko if: actionButtonsColumnCaption -->\n                <th data-bind=\"style: { width: actionButtonsColumnWidth }\" class=\"noselect\">\n                    <div>\n                        <span data-bind=\"text: actionButtonsColumnCaption\"></span>\n                    </div>\n                    <!-- ko if: isAnyFilterEnabled -->\n                    <div>\n                        <input type=\"text\" autocomplete=\"off\" class=\"sffw-listgrid-filter\" disabled style=\"visibility: hidden\" />\n                    </div>\n                    <!-- /ko -->\n                </th>\n            <!-- /ko -->\n            <!-- ko ifnot: actionButtonsColumnCaption -->\n                <td data-bind=\"style: { width: actionButtonsColumnWidth }\">\n                </td>\n            <!-- /ko -->\n            <!-- /action buttons -->\n            </tr>\n        </thead>\n        <tbody data-bind=\"foreach: { data: records, as: 'record' }\">\n        <tr data-bind=\"event: { keyup: function(data, event){if(event.keyCode == 13 && event.target && event.target.localName == 'tr'){$parent.onRowClick(record); return true;} return true;}}, css: $rowCss\" tabindex=\"0\" role=\"button\">\n                <!-- ko if: $parent.checkboxColumnVisible -->\n                    <td style=\"width: 2%; text-align: center;\">\n                        <!-- ko if: $parent.isCheckboxOnRow(record) -->\n                        <span><input tabindex=\"0\" type=\"checkbox\" data-bind=\"checked: record.$selected, click: function(data, event){ $parent.CheckboxSelect(record, $index); return true;}, clickBubble: false\"></input></span>\n                        <!-- /ko -->\n                    </td>\n                <!-- /ko -->\n\n                <!-- ko foreach: { data: $parent.visibleColumns, as: 'column' } -->\n                    <!-- ko if: column.isHtml -->\n                        <td>\n                            <a tabindex=\"-1\" data-bind=\"click: function(data, event){ return $parents[1].onRowClick(record, column, event); }, clickBubble: false, html: record[column.dispName],\n                                attr: { href: $parents[1].getRowHrefLink(record, $parentContext.$index()), 'aria-label': $parents[1].getRowHrefAria(record, $parentContext.$index()) }\"></a>\n                        </td>\n                    <!-- /ko -->\n                    <!-- ko if: !column.isHtml -->\n                        <td>\n                            <a tabindex=\"-1\" data-bind=\"click: function(data, event){ return $parents[1].onRowClick(record, column, event); }, clickBubble: false, text: record[column.dispName],\n                                attr: { href: $parents[1].getRowHrefLink(record, $parentContext.$index()), 'aria-label': $parents[1].getRowHrefAria(record, $parentContext.$index()) }\"></td>\n                        </td>\n                    <!-- /ko -->\n                <!-- /ko -->\n\n                <!-- action buttons -->\n                <td style=\"width: auto;\">\n                    <div class=\"sffw-listgrid-buttons\">\n                    <!-- ko foreach: $parent.actionButtons -->\n                        <!-- ko if: $data.ButtonType === 'link' -->\n                            <a data-bind=\"click: function() { if ($parents[1].dataCollection.$items()[$parentContext.$index()][$data.IsEnabled].$value() === true) $parents[1].ActionButtonClicked($data, record); return true;},\n                                style: { visibility: $parents[1].dataCollection.$items()[$parentContext.$index()][$data.IsVisible].$value() ? 'visible' : 'hidden' },\n                                attr: { title: ($data.IsTitleTextLocalized === true ? $root.$localize($data.TitleText) : $data.TitleText),\n                                    'aria-label': ($data.IsTitleTextLocalized === true ? $root.$localize($data.TitleText) : $data.TitleText),\n                                    href: $parents[1].dataCollection.$items()[$parentContext.$index()][$data.LinkHref].$value(),\n                                    target: $parents[1].dataCollection.$items()[$parentContext.$index()][$data.LinkTarget].$value() },\n                                clickBubble: false\">\n                                <span data-bind=\"text: ($data.IsButtonCaptionLocalized === true ? $root.$localize($data.ButtonCaption) : $data.ButtonCaption)\"></span>\n                                <span data-bind=\"css: $data.ButtonClass\"></span>\n                            </a>\n                        <!-- /ko -->\n                        <!-- ko ifnot: $data.ButtonType === 'link' -->\n                            <button data-bind=\"enable: $parents[1].dataCollection.$items()[$parentContext.$index()][$data.IsEnabled].$value(),\n                                click: function() { $parents[1].ActionButtonClicked($data, record); return true;},\n                                style: { visibility: $parents[1].dataCollection.$items()[$parentContext.$index()][$data.IsVisible].$value() ? 'visible' : 'hidden' },\n                                attr: { title: ($data.IsTitleTextLocalized === true ? $root.$localize($data.TitleText) : $data.TitleText),\n                                    'aria-label': ($data.IsTitleTextLocalized === true ? $root.$localize($data.TitleText) : $data.TitleText) },\n                                clickBubble: false\">\n                                <span data-bind=\"css: $data.ButtonClass\"></span>\n                            </button>\n                        <!-- /ko -->\n                    <!-- /ko -->\n                    </div>\n                </td>\n                <!-- /action buttons -->\n            </tr>\n        </tbody>\n    </table>\n\n    <!-- ko if: pagingControlsPosition === 'bottom' || pagingControlsPosition === 'both' -->\n    <div class=\"sffw-listgrid-paging\">\n        <!-- ko foreach: pagingTemplate -->\n            <span data-bind=\"template: { name: $data }\"></span>\n        <!-- /ko -->\n    </div>\n    <!-- /ko -->\n\n\n    <script type=\"text/html\" id=\"$first\">\n        <button class=\"sffw-listgrid-paging-button\" data-bind=\"click: $parent.onPageMinClick, enable: $parent.pageBackEnabled, attr: { 'aria-label': $root.$localize('ListGrid2$$firstPageAriaLabel') }\"><i class=\"fa fa-fast-backward\"></i></button>\n    </script>\n\n    <script type=\"text/html\" id=\"$previous\">\n        <button class=\"sffw-listgrid-paging-button\" data-bind=\"click: $parent.onPageBackClick, enable: $parent.pageBackEnabled, attr: { 'aria-label': $root.$localize('ListGrid2$$prevPageAriaLabel') }\"><i class=\"fa fa-play fa-flip-horizontal\"></i></button>\n    </script>\n\n    <script type=\"text/html\" id=\"$editableCurrentPage\">\n        <input type=\"number\" autocomplete=\"off\" data-bind=\"textInput: $parent.page, attr: { 'aria-label': $root.$localize('ListGrid2$$pageNumAriaLabel') }\" width=\"10\" style=\"display: inline-block;\" class=\"sffw-listgrid-paging-pageinput\">\n        <span class=\"sffw-listgrid-paging-spin\" data-bind=\"visible: $parent.isLoading() && !$parent.error()\"><i class=\"fa fa-refresh fa-spin\"></i></span>\n        <span class=\"sffw-listgrid-paging-spin\" data-bind=\"visible: !$parent.isLoading() && !$parent.error()\">/</span>\n        <span class=\"sffw-listgrid-paging-spin sffw-listgrid-paging-spin-error\" data-bind=\"visible: $parent.error\"><i class=\"fa fa-exclamation-triangle\"></i></span>\n        <span class=\"sffw-listgrid-paging-pagemax\" data-bind=\"text: $parent.pagesCount\" width=\"10\" style=\"display: inline-block;\"></span>\n    </script>\n\n    <script type=\"text/html\" id=\"$records\">\n        <span style=\"margin-left: 3px;\">(<span data-bind=\"text: $parent.recordsCount\"></span><span data-bind=\"text: $root.$localize('ListGrid2$$recordsLocalization')\" style=\"margin-left: 3px;\"></span>)</span>\n    </script>\n\n    <script type=\"text/html\" id=\"$refresh\">\n        <button class=\"sffw-listgrid-paging-button\" data-bind=\"click: $parent.onPageRefreshClick, attr: { 'aria-label': $root.$localize('ListGrid2$$refreshPageAriaLabel') }\"><i class=\"fa fa-refresh\"></i></button>\n    </script>\n\n    <script type=\"text/html\" id=\"$next\">\n        <button class=\"sffw-listgrid-paging-button\" data-bind=\"click: $parent.onPageForwardClick, enable: $parent.pageForwardEnabled, attr: { 'aria-label': $root.$localize('ListGrid2$$nextPageAriaLabel') }\"><i class=\"fa fa-play\"></i></button>\n    </script>\n\n    <script type=\"text/html\" id=\"$last\">\n        <button class=\"sffw-listgrid-paging-button\" data-bind=\"click: $parent.onPageMaxClick, enable: $parent.pageForwardEnabled, attr: { 'aria-label': $root.$localize('ListGrid2$$lastPageAriaLabel') }\"><i class=\"fa fa-fast-forward\"></i></button>\n    </script>\n\n    <script type=\"text/html\" id=\"$pageSize\">\n        <select style=\"margin:0 3px 0 3px;\" data-bind=\"options: $parent.pageSizeValues, value: $parent.pageSize, attr: { 'aria-label': $root.$localize('ListGrid2$$pageSizeAriaLabel') }\"/>\n    </script>\n\n    <script type=\"text/html\" id=\"$viewSettings\">\n    <!-- ko if: $parent.isViewSettingsComponentAvailable() === true -->\n        <button class=\"sffw-listgrid-paging-button sffw-listgrid-view-settings-button\" data-bind=\"click: $parent.onViewSettingsClick, attr: { 'aria-label': $root.$localize('ListGrid2$$viewSettings') }\"><i class=\"fa fa-cog\"></i></button>\n    <!-- /ko -->\n    </script>\n\n    <script type=\"text/html\" id=\"$clearFilters\">\n        <button class=\"sffw-listgrid-paging-button sffw-listgrid-clear-button\" data-bind=\"click: $parent.onClearFiltersClick, attr: { 'aria-label': $root.$localize('ListGrid2$$clearFilters') }\"><i class=\"fa fa-filter icon-crossed-out\"></i></button>\n    </script>\n\n    <div class=\"sffw-listgrid-error\" data-bind=\"visible: error, text: error\"></div>\n</div>"
                });
            }
        })(listGrid2 = components.listGrid2 || (components.listGrid2 = {}));
    })(components = sffw.components || (sffw.components = {}));
})(sffw || (sffw = {}));
var sffw;
(function (sffw) {
    function assert(condition, message) {
        if (!condition) {
            if (message) {
                console.error('Assertion failed: ' + message);
            }
            else {
                console.error('Assertion failed');
            }
        }
    }
    sffw.assert = assert;
})(sffw || (sffw = {}));
var sffw;
(function (sffw) {
    function formatAsAmountOrCurrency(strValue, formatAsAmount, formatAsCurrency) {
        var decimalSign = window.sf.localization.currentCulture().getDecimalSign();
        var thousandSign = window.sf.localization.currentCulture().getThousandSign();
        var places = 0; // pocet destinych pozic
        var symbol = '\u20AC'; // euro znak
        if (formatAsCurrency) {
            places = 2;
        }
        if (formatAsAmount) {
            places = 6;
        }
        var numValue = strValue.replace(decimalSign, '.');
        var decimalPart = numValue.split('.');
        var negative = numValue < 0 ? '-' : '';
        var i = parseInt(numValue = Math.abs(+numValue || 0).toFixed(places), 10) + '';
        var j = i.length > 3 ? (i.length) % 3 : 0;
        return negative + (j ? i.substr(0, j) + thousandSign : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousandSign) + (typeof decimalPart[1] !== 'undefined' ? (decimalSign + decimalPart[1]) : '') + (formatAsCurrency ? ' ' + symbol : '');
    }
    sffw.formatAsAmountOrCurrency = formatAsAmountOrCurrency;
})(sffw || (sffw = {}));
