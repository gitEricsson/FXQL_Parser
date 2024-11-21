export class DatabaseConnectionSingleton {
  private static instance: DatabaseConnectionSingleton;
  private connection: any;

  private constructor() {}

  public static getInstance(): DatabaseConnectionSingleton {
    if (!DatabaseConnectionSingleton.instance) {
      DatabaseConnectionSingleton.instance = new DatabaseConnectionSingleton();
    }
    return DatabaseConnectionSingleton.instance;
  }

  public setConnection(connection: any) {
    this.connection = connection;
  }

  public getConnection() {
    return this.connection;
  }
}
