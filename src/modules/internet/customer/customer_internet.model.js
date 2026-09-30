module.exports = (sequelize, DataTypes) => {
    const CustomerInternet = sequelize.define(
        'customer_internet',
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
            nama: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            no_telp: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            alamat: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            status_aktivasi: {
                type: DataTypes.ENUM('aktif', 'nonaktif', 'pending'),
                allowNull: false,
                defaultValue: 'pending',
            },

            // AUDIT 
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
            modelName: 'customer_internet',
            tableName: 'customer_internet',
            timestamps: false,
            underscored: true,
        }
    );

    CustomerInternet.associate = (models) => {
        CustomerInternet.belongsTo(models.user, {
            foreignKey: 'user_id',
            as: 'user',
        });
    };

    return CustomerInternet;
};
