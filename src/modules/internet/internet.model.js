module.exports = (sequelize, DataTypes) => {
    const Internet = sequelize.define(
        'internet',
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

            // ─── KAS 
            kas_cash: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                comment: 'Kas masuk (tunai)',
            },
            kas_bank: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                comment: 'Kas masuk (transfer bank)',
            },

            
            iuran_cash: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                comment: 'Iuran bulanan internet (tunai)',
            },
            iuran_bank: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                comment: 'Iuran bulanan internet (transfer bank)',
            },

            // ─── PENGELUARAN → AKTIFASI KE ICONET 
            aktifasi_rek_internet: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                comment: 'Pengeluaran aktifasi rekening internet ke Iconet',
            },
            aktifasi_edc_brilink: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                comment: 'Pengeluaran aktifasi via EDC / BRILink ke Iconet',
            },

            
            pengeluaran_insentif: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                comment: 'Pengeluaran insentif',
            },
            pengeluaran_admin_transaksi_bank: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                comment: 'Pengeluaran admin & transaksi bank',
            },
            pengeluaran_belanja_lainnya: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                comment: 'Pengeluaran belanja / lainnya',
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
            modelName: 'internet',
            tableName: 'internet',
            timestamps: false,
            underscored: true,
        }
    );
    
    Internet.associate = (models) => {
        Internet.belongsTo(models.user, {
            foreignKey: 'user_id',
            as: 'user'
        });
    }

    return Internet;
};
