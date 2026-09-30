module.exports = (sequelize, DataTypes) => {
    const Rekening = sequelize.define(
        'rekening',
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
            nama: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            nomor: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            saldo: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
            },
            deskripsi: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            is_aktif: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            kode_bank: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            unit_usaha: {
                type: DataTypes.ENUM('internet', 'resik', 'niaga', 'mina', 'kantor_pusat'),
                allowNull: false,
                defaultValue: 'kantor_pusat',
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
            modelName: 'rekening',
            tableName: 'rekening',
            timestamps: false,
            underscored: true,
        }
    );

    // Rekening tidak berelasi ke user — data master BUMDes

    return Rekening;
};
