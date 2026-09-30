module.exports = (sequelize, DataTypes) => {
    const Resik = sequelize.define(
        'resik',
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

            // DEBET: KAS 
            kas_cash: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                comment: 'Debet kas (tunai)',
            },
            kas_bank: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                comment: 'Debet kas (bank)',
            },

            // DEBET: PENERIMAAN IURAN 
            iuran_cash: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                comment: 'Penerimaan iuran (tunai)',
            },
            iuran_bank: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                comment: 'Penerimaan iuran (bank)',
            },

            // KREDIT: BIAYA 
            biaya_insentif: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                comment: 'Kredit biaya insentif',
            },
            biaya_bbm: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                comment: 'Kredit biaya BBM',
            },
            biaya_cuci_bongkar: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                comment: 'Kredit biaya cuci & bongkar',
            },
            biaya_beban_setor: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                comment: 'Kredit beban setor',
            },

            // KREDIT: LAINNYA 
            kredit_belanja_lainnya: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                comment: 'Kredit belanja / lainnya',
            },
            kredit_admin_fee: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                comment: 'Kredit admin fee',
            },

            // ─── EXPENSE SOURCE
            expense_source: {
                type: DataTypes.STRING(50),
                allowNull: true,
                comment: 'Sumber dana untuk pengeluaran (kas_cash atau kas_bank)',
            },

            // ─── SALDO 
            saldo_cash: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                comment: 'Saldo akhir (tunai)',
            },
            saldo_bank: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                comment: 'Saldo akhir (bank)',
            },

            // ─── AUDIT 
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
        {
            sequelize,
            modelName: 'resik',
            tableName: 'resik',
            timestamps: false,
            underscored: true,
        }
    );
    
    Resik.associate = (models) => {
        Resik.belongsTo(models.user, {
            foreignKey: 'user_id',
            as: 'user'
        });
    }

    return Resik;
};