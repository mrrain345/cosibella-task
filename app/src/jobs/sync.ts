import { databaseService, DatabaseService } from "../services/database"
import { env } from "../config/env"
import { ordersService, OrdersService } from "../services/orders"
import { logger } from "../config/logger"

/** Job that periodically fetches all IdoSell orders and persists them to the database. */
export class SyncJob {
  private _ordersService: OrdersService
  private _databaseService: DatabaseService
  private _timer: NodeJS.Timeout | null = null
  private _isRunning = false

  constructor(
    _ordersService: OrdersService = ordersService,
    _databaseService: DatabaseService = databaseService,
  ) {
    this._ordersService = _ordersService
    this._databaseService = _databaseService
  }

  /** Start the job: run immediately, then repeat every 5 minutes. */
  start(): void {
    void this._run()
    this._timer = setInterval(
      () => void this._run(),
      env.IDOSELL_SYNC_INTERVAL_SEC * 1000,
    )
  }

  /** Stop the job and clear the interval. */
  stop(): void {
    if (this._timer !== null) {
      clearInterval(this._timer)
      this._timer = null
    }
  }

  /** Run the job: fetch all orders and persist them to the database. */
  private async _run(): Promise<void> {
    if (this._isRunning) {
      logger.warn("Sync job skipped — previous run still in progress")
      return
    }

    this._isRunning = true
    logger.info(
      `Sync job started (interval: ${env.IDOSELL_SYNC_INTERVAL_SEC} sec)`,
    )

    try {
      const orders = await this._ordersService.getAllOrders()
      await this._databaseService.upsertOrders(orders)
      logger.info(`Sync job completed — ${orders.length} orders upserted`)
    } catch (err) {
      logger.error(err, "Sync job failed")
    } finally {
      this._isRunning = false
    }
  }
}

export const syncJob = new SyncJob()
