module.exports = (sequelize, DataTypes) => {
    const Niaga = sequelize.define(
        'niaga',
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
                allowNull: false,
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

            // ─── SALDO TUNGGAL
            // Niaga menggunakan model transaksi sederhana (tidak ada breakdown debet/kredit)
            nominal: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                comment: 'Nominal transaksi (positif = pemasukan, negatif = pengeluaran)',
            },
            saldo: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                comment: 'Saldo berjalan transaksi',
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
            modelName: 'niaga',
            tableName: 'niaga',
            timestamps: false,
            underscored: true,
        }
    );

    Niaga.associate = (models) => {
        Niaga.belongsTo(models.user, {
            foreignKey: 'user_id',
            as: 'user',
        });
    };

    return Niaga;
};
