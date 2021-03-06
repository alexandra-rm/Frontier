import React, { FunctionComponent, useEffect } from 'react';
import MaterialTable, { MTableToolbar } from 'material-table';
import { IconButton } from '@material-ui/core';
import styled from '@emotion/styled';
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import { Button, TextField } from '@material-ui/core';
import { connect } from 'react-redux';

import { Store } from '@/store';
import { actions, EventUser, Status, Visitor, NewVisitor, VisitorsWithTimestamp } from './reducer';
import { Tariff } from '@/screens/';
import { AlertDialog } from '@/components';
import { calculateCostHelper, calculateDuration, localizationMaterialTable } from '@/utils';
import { Status as TariffStatus } from '../TariffsScreen/reducer';

type Props = {
    visitors: Array<Visitor>;
    tariffs: Array<Tariff>;
    defaultTariff: number;
    modals: {
        payVisitors: boolean;
        historyVisitors: boolean;
    };
    total: number;
    payedVisitors: Array<Visitor>;
    timer: number;
    addVisitor(visitor: NewVisitor): void;
    editVisitor(visitor: Visitor): void;
    deleteVisitor(visitor: Visitor): void;
    eventVisitor(event: EventUser): void;
    deleteSelectedVisitors(visitors: Array<Visitor>): void;
    paySelectedVisitors(selectedVisitors: VisitorsWithTimestamp): void;
    toggleModalPayVisitors(status: boolean): void;
    toggleModalHistoryVisitors(status: boolean): void;
    calculateTotal(total: number): void;
    setPayedVisitors(visitors: Array<Visitor>): void;
    updateTimer(timestamp: number): void;
    putVisitorsHistory(): void;
};

interface NumberToString {
    [n: number]: string;
}

const Controls = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`;
const TableHeader = styled.div`
    display: flex;
    padding: 10px 24px;
    justify-content: space-between;
    align-items: center;
`;
const INVALID_NAME_ERROR = 'Такое имя уже есть!';

const isPayedVisitors = (visitors: Visitor[]) => {
    const filteredVisitors = visitors.filter((visitor) => {
        return visitor.status !== Status.finished;
    });
    return filteredVisitors.length <= 0;
};
const getFunctionForRow = (action: (visitor: Visitor) => void) => {
    return (newData: Visitor) => {
        action(newData);
        return Promise.resolve();
    };
};
const VisitorsComponent: FunctionComponent<Props> = ({
    payedVisitors,
    total,
    visitors,
    tariffs,
    defaultTariff,
    modals,
    addVisitor,
    editVisitor,
    deleteVisitor,
    eventVisitor,
    deleteSelectedVisitors,
    paySelectedVisitors,
    toggleModalPayVisitors,
    toggleModalHistoryVisitors,
    calculateTotal,
    setPayedVisitors,
    updateTimer,
    putVisitorsHistory,
}) => {
    const handleTogglePause = (currentUser: Visitor) => {
        const updatedVisitor: Visitor = visitors.find((visitor) => visitor.id === currentUser.id)!;
        if (updatedVisitor.status === Status.active) {
            eventVisitor({ timestamp: Date.now(), status: Status.pause, id: currentUser.id });
        } else {
            eventVisitor({ timestamp: Date.now(), status: Status.active, id: currentUser.id });
        }
    };
    const [fastVisitorName, setFastVisitorName] = React.useState('');
    const [fastVisitorNameInvalid, setFastVisitorNameInvalid] = React.useState(false);
    const validateVisitorName = (name: string) => {
        return visitors.map((item) => item.name.toLowerCase()).includes(name.toLowerCase());
    };
    const changeVisitorFast = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFastVisitorName(event.target.value);
        const isInvalidName = validateVisitorName(event.target.value);
        setFastVisitorNameInvalid(isInvalidName);
    };
    const submitVisitorFast = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!fastVisitorName || fastVisitorNameInvalid) {
            return;
        }
        addVisitor({ name: fastVisitorName, tariffId: defaultTariff, discount: 0 });
        setFastVisitorName('');
    };
    let tariffsColumn: NumberToString = {};
    tariffsColumn = tariffs.reduce(function (newArr, tariff) {
        if (tariff.status === TariffStatus.active) {
            newArr[tariff.id] = tariff.title;
        }
        return newArr;
    }, tariffsColumn);

    useEffect(() => {
        const interval = setInterval(() => {
            updateTimer(Date.now());
        }, 60000);
        return () => {
            clearInterval(interval);
        };
    });

    return (
        <>
            <MaterialTable
                title="Посетители"
                columns={[
                    {
                        title: 'Имя',
                        field: 'name',
                        validate: (rowData) => {
                            if (
                                rowData.name &&
                                validateVisitorName(rowData.name) &&
                                !visitors.map((item) => item.id).includes(rowData.id)
                            ) {
                                return INVALID_NAME_ERROR;
                            } else {
                                return '';
                            }
                        },
                    },
                    {
                        title: 'Тариф',
                        field: 'tariffId',
                        lookup: tariffsColumn,
                        initialEditValue: defaultTariff,
                        validate: (rowData) => {
                            if (!rowData.tariffId) {
                                return 'Укажите тариф';
                            } else {
                                return '';
                            }
                        },
                    },
                    {
                        title: 'Скидка, %',
                        field: 'discount',
                        initialEditValue: 0,
                        type: 'numeric',
                    },
                    {
                        title: 'Продолжительность посещения',
                        field: 'duration',
                        type: 'numeric',
                        editable: 'onUpdate',
                        initialEditValue: '0',
                        render: (rowData) => {
                            return <>{rowData.times ? calculateDuration(rowData.times) : 0}</>;
                        },
                    },
                    {
                        title: 'Стоимость',
                        field: 'cost',
                        type: 'numeric',
                        render: (rowData) => {
                            return <>{calculateCostHelper(rowData, tariffs)}</>;
                        },
                    },
                    {
                        field: 'status',
                        title: '',
                        editable: 'never',
                        initialEditValue: 'active',
                        defaultSort: 'asc',
                        render: (rowData) => {
                            let icon;
                            if (rowData.status === Status.active) {
                                icon = <PauseIcon />;
                            } else if (rowData.status === Status.pause) {
                                icon = <PlayArrowIcon />;
                            } else {
                                return '';
                            }
                            return (
                                <Controls>
                                    <IconButton
                                        aria-label="Control"
                                        onClick={() => handleTogglePause(rowData)}
                                    >
                                        {icon}
                                    </IconButton>
                                </Controls>
                            );
                        },
                    },
                ]}
                data={JSON.parse(JSON.stringify(visitors))}
                editable={{
                    onRowAdd: getFunctionForRow(addVisitor),
                    onRowUpdate: getFunctionForRow(editVisitor),
                    onRowDelete: getFunctionForRow(deleteVisitor),
                }}
                actions={[
                    {
                        tooltip: 'Удалить',
                        icon: 'delete',
                        onClick: (evt, data) => {
                            data = Array.isArray(data) ? data : [data];
                            deleteSelectedVisitors(data);
                        },
                    },
                    {
                        tooltip: 'Рассчитать',
                        icon: 'payment',
                        onClick: (evt, data) => {
                            data = Array.isArray(data) ? data : [data];
                            const total = calculateCostHelper(data, tariffs);
                            calculateTotal(total);
                            setPayedVisitors(data);
                            toggleModalPayVisitors(true);
                        },
                    },
                ]}
                localization={localizationMaterialTable}
                options={{
                    pageSize: 20,
                    selection: true,
                    actionsColumnIndex: -1,
                    sorting: true,
                    rowStyle: (rowData) => ({
                        backgroundColor: rowData.status === Status.finished ? '#e9e8eb' : '#FFF',
                        color: rowData.status === Status.finished ? '#bfbfbf' : 'black',
                    }),
                }}
                components={{
                    Toolbar: (props) => (
                        <>
                            <MTableToolbar {...props} />
                            <TableHeader>
                                <form noValidate onSubmit={submitVisitorFast}>
                                    <TextField
                                        autoFocus={true}
                                        label="Новый посетитель"
                                        onChange={changeVisitorFast}
                                        value={fastVisitorName}
                                        helperText={
                                            fastVisitorNameInvalid ? INVALID_NAME_ERROR : ''
                                        }
                                        error={fastVisitorNameInvalid}
                                    />
                                </form>
                                <Button
                                    color="secondary"
                                    variant="contained"
                                    onClick={() => {
                                        isPayedVisitors(visitors)
                                            ? putVisitorsHistory()
                                            : toggleModalHistoryVisitors(true);
                                    }}
                                >
                                    Закрыть день
                                </Button>
                            </TableHeader>
                        </>
                    ),
                }}
            />
            <AlertDialog
                agreeButtonText="Расчитать"
                disagreeButtonText="Отмена"
                agreeOnClick={() => {
                    paySelectedVisitors({ visitors: payedVisitors, timestamp: Date.now() });
                    toggleModalPayVisitors(false);
                }}
                dialogTitle="Рассчитать посетителей"
                dialogContent={'Итого к расчету: ' + total}
                isOpen={modals.payVisitors}
                close={() => toggleModalPayVisitors(false)}
            />
            <AlertDialog
                agreeButtonText="Закрыть"
                agreeOnClick={() => {
                    toggleModalHistoryVisitors(false);
                }}
                dialogTitle="Чтобы закрыть день, рассчитайте всех посетителей!"
                isOpen={modals.historyVisitors}
            />
        </>
    );
};

const mapStateToProps = (store: Store) => {
    return {
        visitors: store.visitors.visitors,
        tariffs: store.tariffs.tariffs,
        defaultTariff: store.tariffs.defaultTariff,
        modals: store.visitors.modals,
        total: store.visitors.total,
        payedVisitors: store.visitors.payedVisitors,
        timer: store.visitors.timer,
    };
};

const mapDispatchToProps = {
    addVisitor: actions.add,
    editVisitor: actions.edit,
    deleteVisitor: actions.delete,
    eventVisitor: actions.event,
    deleteSelectedVisitors: actions.selectedDelete,
    paySelectedVisitors: actions.selectedPay,
    toggleModalPayVisitors: actions.modalPayToggle,
    toggleModalHistoryVisitors: actions.modalHistoryToggle,
    calculateTotal: actions.totalCalculate,
    setPayedVisitors: actions.payedVisitorsSet,
    updateTimer: actions.timerUpdate,
    putVisitorsHistory: actions.historyPut,
};

export const VisitorsScreen = connect(mapStateToProps, mapDispatchToProps)(VisitorsComponent);
