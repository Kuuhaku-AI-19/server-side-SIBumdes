module.exports = (sequelize, DataTypes) => {
    const KantorPusat = sequelize.define(
        'kantor_pusat',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            uuid: {
                type: DataTypes.UUID,
                allowNull: false,
                defaultValue: DataTypes.UUIDV4,
                unique: true,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            tanggal: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            keterangan: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            bulan: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            tahun: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 2026,
            },
            kas_bank_jateng: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
            },
            kas_cash: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
            },
            debet_bank: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
            },
            debet_cash: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
            },
            kredit_insentif: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
            },
            kredit_belanja: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
            },
            kredit_transaksi_bank: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
            },
            saldo_cash: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
            },
            saldo_bank: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
            },
            expense_source: {
                type: DataTypes.STRING(50),
                allowNull: true,
                comment: 'Sumber dana untuk pengeluaran (misal: kas_cash, kas_bank_jateng)',
            },
            rekening_bank: {
                type: DataTypes.ENUM('bank_bri', 'bank_jateng'),
                allowNull: false,
                defaultValue: 'bank_jateng',
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            updated_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {   sequelize,
            modelName: 'kantor_pusat',
            tableName: 'kantor_pusat',
            timestamps: false,
            underscored: true,
        }
    );
    
    KantorPusat.associate = (models) => {
        KantorPusat.belongsTo(models.user, {
            foreignKey: 'user_id',
            as: 'user'
        });
    }

    return KantorPusat;
};